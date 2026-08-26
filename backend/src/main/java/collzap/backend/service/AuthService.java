package collzap.backend.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import collzap.backend.config.CollzapProperties;
import collzap.backend.dto.AuthDtos.AccessTokenResponse;
import collzap.backend.dto.AuthDtos.AdminAuthResponse;
import collzap.backend.dto.AuthDtos.AdminLoginRequest;
import collzap.backend.dto.AuthDtos.AuthResponse;
import collzap.backend.dto.AuthDtos.OtpSentResponse;
import collzap.backend.dto.AuthDtos.RequestOtpRequest;
import collzap.backend.dto.AuthDtos.VerifyOtpRequest;
import collzap.backend.enums.OtpPurpose;
import collzap.backend.enums.Status;
import collzap.backend.exception.ForbiddenException;
import collzap.backend.exception.UnauthorizedException;
import collzap.backend.exception.BadRequestException;
import collzap.backend.models.AdminUser;
import collzap.backend.models.College;
import collzap.backend.models.RefreshToken;
import collzap.backend.models.User;
import collzap.backend.repositories.AdminUserRepository;
import collzap.backend.repositories.RefreshTokenRepository;
import collzap.backend.repositories.UserRepository;
import collzap.backend.security.JwtService;

/**
 * Signup, login and token lifecycle. Signup and login are the same two calls —
 * request a code, then verify it — because the college email decides everything
 * and there is no password to collect.
 */
@Service
public class AuthService {

    private static final String TOKEN_BYTES_ALGORITHM = "SHA-256";
    private static final int REFRESH_TOKEN_BYTES = 32;

    private final UserRepository userRepository;
    private final AdminUserRepository adminUserRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final CollegeService collegeService;
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
        CollegeService collegeService,
        OtpService otpService,
        JwtService jwtService,
        OnboardingService onboardingService,
        PasswordEncoder passwordEncoder,
        CollzapProperties properties
    ) {
        this.userRepository = userRepository;
        this.adminUserRepository = adminUserRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.collegeService = collegeService;
        this.otpService = otpService;
        this.jwtService = jwtService;
        this.onboardingService = onboardingService;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
    }

    @Transactional
    public OtpSentResponse requestOtp(RequestOtpRequest request) {
        String email = OtpService.normalize(request.email());
        College college = collegeService.requireByEmail(email);
        boolean existing = userRepository.existsByEmailIgnoreCase(email);

        if (Boolean.TRUE.equals(request.isSignup()) && existing) {
            throw new BadRequestException("An account with this email already exists. Please log in.");
        }
        if (Boolean.FALSE.equals(request.isSignup()) && !existing) {
            throw new BadRequestException("No account found with this email. Please sign up.");
        }

        long expiresIn = otpService.issue(email, existing ? OtpPurpose.LOGIN : OtpPurpose.SIGNUP);

        return new OtpSentResponse(
            email,
            college.getName(),
            existing,
            expiresIn,
            existing
                ? "Welcome back. We sent a code to your college email."
                : "We sent a code to your college email to confirm it is yours."
        );
    }

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        String email = OtpService.normalize(request.email());
        College college = collegeService.requireByEmail(email);

        User existing = userRepository.findByEmailIgnoreCase(email).orElse(null);
        OtpPurpose purpose = existing != null ? OtpPurpose.LOGIN : OtpPurpose.SIGNUP;
        otpService.verify(email, request.code(), purpose);

        User user;
        if (existing != null) {
            if (existing.getAccountStatus() == Status.DELETED) {
                existing.setAccountStatus(Status.ACTIVE);
                existing.setProfileVisible(true);
                existing.setNotificationsEnabled(true);
            }
            user = existing;
        } else {
            user = new User(college, email, defaultName(request.name(), email));
            user = userRepository.save(user);
        }
        user.setLastSeenAt(Instant.now());
        user = userRepository.save(user);

        return buildAuthResponse(user);
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
    public void logoutEverywhere(java.util.UUID userId) {
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

    /** Name is auto-filled from the email local part when signup did not supply one. */
    private static String defaultName(String supplied, String email) {
        if (supplied != null && !supplied.isBlank()) {
            return supplied.trim();
        }
        String localPart = email.substring(0, email.indexOf('@'));
        String cleaned = localPart.replaceAll("[._\\-0-9]+", " ").trim();
        if (cleaned.isEmpty()) {
            return localPart;
        }
        StringBuilder builder = new StringBuilder(cleaned.length());
        boolean capitalise = true;
        for (char ch : cleaned.toCharArray()) {
            builder.append(capitalise ? Character.toUpperCase(ch) : ch);
            capitalise = ch == ' ';
        }
        return builder.toString();
    }
}
