package collzap.backend.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import collzap.backend.config.CollzapProperties;
import collzap.backend.dto.AuthDtos.AccessTokenResponse;
import collzap.backend.dto.AuthDtos.AdminAuthResponse;
import collzap.backend.dto.AuthDtos.AdminLoginRequest;
import collzap.backend.dto.AuthDtos.AuthResponse;
import collzap.backend.dto.AuthDtos.ForgotPasswordRequest;
import collzap.backend.dto.AuthDtos.LoginRequest;
import collzap.backend.dto.AuthDtos.OtpIssuedResponse;
import collzap.backend.dto.AuthDtos.ResetPasswordRequest;
import collzap.backend.dto.AuthDtos.SignupRequest;
import collzap.backend.dto.AuthDtos.SignupResponse;
import collzap.backend.dto.UserDtos.OnboardingStateResponse;
import collzap.backend.enums.OtpPurpose;
import collzap.backend.enums.Status;
import collzap.backend.exception.BadRequestException;
import collzap.backend.exception.ForbiddenException;
import collzap.backend.exception.NotFoundException;
import collzap.backend.exception.PasswordResetRequiredException;
import collzap.backend.exception.UnauthorizedException;
import collzap.backend.models.AdminUser;
import collzap.backend.models.RefreshToken;
import collzap.backend.models.User;
import collzap.backend.repositories.AdminUserRepository;
import collzap.backend.repositories.RefreshTokenRepository;
import collzap.backend.repositories.UserRepository;
import collzap.backend.security.JwtService;

/**
 * Signup, login, forgot-password and token lifecycle. Any email works — the app
 * doesn't require a college address to sign up; college affiliation is captured
 * later, during student verification, not here.
 */
@Service
public class AuthService {

    private static final String TOKEN_BYTES_ALGORITHM = "SHA-256";
    private static final int REFRESH_TOKEN_BYTES = 32;

    private final UserRepository userRepository;
    private final AdminUserRepository adminUserRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OtpService otpService;
    private final JwtService jwtService;
    private final OnboardingService onboardingService;
    private final PasswordEncoder passwordEncoder;
    private final CollzapProperties properties;
    private final SecureRandom random = new SecureRandom();

    public AuthService(
        UserRepository userRepository,
        AdminUserRepository adminUserRepository,
        RefreshTokenRepository refreshTokenRepository,
        OtpService otpService,
        JwtService jwtService,
        OnboardingService onboardingService,
        PasswordEncoder passwordEncoder,
        CollzapProperties properties
    ) {
        this.userRepository = userRepository;
        this.adminUserRepository = adminUserRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.otpService = otpService;
        this.jwtService = jwtService;
        this.onboardingService = onboardingService;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
    }

    @Transactional
    public SignupResponse signup(SignupRequest request) {
        String email = OtpService.normalize(request.email());
        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);

        // SECURITY-CRITICAL: key this off emailVerified, not hasPassword(). Every
        // pre-existing (legacy) account has hasPassword()==false too — checking
        // password presence here would let anyone "sign up" with an existing user's
        // email, silently set a brand-new password on THEIR account, and get logged
        // straight into it with no OTP check at all. emailVerified correctly tells
        // apart a real account (legacy, always true; or modern-and-completed, true)
        // from an abandoned first-time signup nobody ever proved ownership of
        // (false) — only the latter is safe to let a retry reclaim.
        if (user != null && user.isEmailVerified()) {
            throw new BadRequestException(
                "An account with this email already exists. Log in, or use Forgot Password if you don't have a password set.");
        }
        if (user == null) {
            user = new User(null, email, request.name().trim());
            user.setEmailVerified(false);
        } else {
            user.setName(request.name().trim());
        }
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user = userRepository.save(user);

        long otpExpiresIn = otpService.issue(email, OtpPurpose.SIGNUP);
        AuthResponse auth = buildAuthResponse(user);
        return new SignupResponse(
            auth.accessToken(), auth.refreshToken(), auth.tokenType(),
            auth.expiresInSeconds(), auth.nextStep(), auth.user(), otpExpiresIn
        );
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = OtpService.normalize(request.email());
        User user = userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new UnauthorizedException("Email or password is incorrect"));

        if (!user.hasPassword()) {
            throw new PasswordResetRequiredException(
                "This account has no password yet. Reset your password to continue.");
        }
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Email or password is incorrect");
        }
        reactivateIfDeleted(user);
        user.setLastSeenAt(Instant.now());
        return buildAuthResponse(userRepository.save(user));
    }

    @Transactional
    public OtpIssuedResponse forgotPassword(ForgotPasswordRequest request) {
        String email = OtpService.normalize(request.email());
        if (!userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("No account found with this email.");
        }
        long expiresIn = otpService.issue(email, OtpPurpose.PASSWORD_RESET);
        return new OtpIssuedResponse(email, expiresIn, "We sent a code to reset your password.");
    }

    @Transactional
    public AuthResponse resetPassword(ResetPasswordRequest request) {
        String email = OtpService.normalize(request.email());
        User user = userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new BadRequestException("No account found with this email."));
        otpService.verify(email, request.code(), OtpPurpose.PASSWORD_RESET);

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        // Proving control of the inbox this way satisfies email verification too —
        // this is exactly what lets a pre-existing no-password account "just work"
        // through this same endpoint, with no separate migration flow.
        user.setEmailVerified(true);
        reactivateIfDeleted(user);
        return buildAuthResponse(userRepository.save(user));
    }

    @Transactional
    public OnboardingStateResponse verifyEmail(UUID userId, String code) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found"));
        otpService.verify(user.getEmail(), code, OtpPurpose.SIGNUP);
        user.setEmailVerified(true);
        userRepository.save(user);
        return onboardingService.describe(user);
    }

    @Transactional
    public OtpIssuedResponse resendVerifyEmail(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found"));
        if (user.isEmailVerified()) {
            throw new BadRequestException("Your email is already verified");
        }
        long expiresIn = otpService.issue(user.getEmail(), OtpPurpose.SIGNUP);
        return new OtpIssuedResponse(user.getEmail(), expiresIn, "New code sent.");
    }

    @Transactional
    public AccessTokenResponse refresh(String rawRefreshToken) {
        RefreshToken stored = refreshTokenRepository.findByTokenHash(sha256(rawRefreshToken))
            .orElseThrow(() -> new UnauthorizedException("Refresh token is not valid"));
        if (!stored.isActive(Instant.now())) {
            throw new UnauthorizedException("Refresh token has expired. Sign in again.");
        }
        User user = stored.getUser();
        if (user.getAccountStatus() == Status.DELETED) {
            throw new ForbiddenException("This account has been deleted");
        }
        return new AccessTokenResponse(
            jwtService.issueUserToken(user),
            "Bearer",
            jwtService.accessTokenTtlSeconds()
        );
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }
        refreshTokenRepository.findByTokenHash(sha256(rawRefreshToken)).ifPresent(token -> {
            token.setRevokedAt(Instant.now());
            refreshTokenRepository.save(token);
        });
    }

    @Transactional
    public void logoutEverywhere(UUID userId) {
        refreshTokenRepository.revokeAllForUser(userId, Instant.now());
    }

    @Transactional(readOnly = true)
    public AdminAuthResponse adminLogin(AdminLoginRequest request) {
        AdminUser admin = adminUserRepository.findByUsernameIgnoreCase(request.username().trim())
            .orElseThrow(() -> new UnauthorizedException("Username or password is incorrect"));
        if (!passwordEncoder.matches(request.password(), admin.getPasswordHash())) {
            throw new UnauthorizedException("Username or password is incorrect");
        }
        return new AdminAuthResponse(
            jwtService.issueAdminToken(admin),
            "Bearer",
            jwtService.accessTokenTtlSeconds(),
            admin.getUsername(),
            admin.getRole()
        );
    }

    /** Also used after verification approval, so the new token carries the updated claim. */
    @Transactional
    public AuthResponse buildAuthResponse(User user) {
        String refreshToken = issueRefreshToken(user);
        return new AuthResponse(
            jwtService.issueUserToken(user),
            refreshToken,
            "Bearer",
            jwtService.accessTokenTtlSeconds(),
            onboardingService.nextStep(user),
            UserService.toResponse(user)
        );
    }

    private static void reactivateIfDeleted(User user) {
        if (user.getAccountStatus() == Status.DELETED) {
            user.setAccountStatus(Status.ACTIVE);
            user.setProfileVisible(true);
            user.setNotificationsEnabled(true);
        }
    }

    private String issueRefreshToken(User user) {
        byte[] bytes = new byte[REFRESH_TOKEN_BYTES];
        random.nextBytes(bytes);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        refreshTokenRepository.save(new RefreshToken(
            user,
            sha256(raw),
            Instant.now().plus(properties.getJwt().getRefreshTokenTtl())
        ));
        return raw;
    }

    /**
     * Refresh tokens are opaque random strings, so a plain digest is enough — there
     * is no low-entropy secret to slow an attacker down over.
     */
    private static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance(TOKEN_BYTES_ALGORITHM);
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is unavailable", ex);
        }
    }
}
