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
import collzap.backend.enums.RefreshTokenRevocation;
import collzap.backend.enums.Status;
import collzap.backend.exception.BadRequestException;
import collzap.backend.exception.ForbiddenException;
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
    private static final java.time.Duration REFRESH_REUSE_GRACE = java.time.Duration.ofSeconds(30);

    private final UserRepository userRepository;
    private final AdminUserRepository adminUserRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RefreshTokenSecurityService refreshTokenSecurity;
    private final OtpService otpService;
    private final JwtService jwtService;
    private final OnboardingService onboardingService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final CollzapProperties properties;
    private final SecureRandom random = new SecureRandom();

    public AuthService(
        UserRepository userRepository,
        AdminUserRepository adminUserRepository,
        RefreshTokenRepository refreshTokenRepository,
        RefreshTokenSecurityService refreshTokenSecurity,
        OtpService otpService,
        JwtService jwtService,
        OnboardingService onboardingService,
        UserService userService,
        PasswordEncoder passwordEncoder,
        CollzapProperties properties
    ) {
        this.userRepository = userRepository;
        this.adminUserRepository = adminUserRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenSecurity = refreshTokenSecurity;
        this.otpService = otpService;
        this.jwtService = jwtService;
        this.onboardingService = onboardingService;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
    }

    @Transactional
    public SignupResponse signup(SignupRequest request) {
        String email = OtpService.normalize(request.email());
        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);

        // SECURITY-CRITICAL: reject signup outright whenever a row already exists
        // for this email — verified or not. A previous version of this method let
        // a *second* signup call "reclaim" an unverified row: it overwrote that
        // row's name and password hash and handed back live access + refresh
        // tokens, unconditionally, before anyone had proven they owned the inbox.
        // Knowing someone's email — not owning it — was enough to take over
        // whatever that address had signed up for and hold a valid session on it.
        //
        // There is no such thing as a safe "unverified, so it's probably an
        // abandoned retry by the same person" inference from the server's side:
        // the request carries no proof of who is asking. The only proof this app
        // ever accepts is an OTP delivered to the inbox itself, and resetPassword()
        // below already does exactly that — it works on ANY existing row
        // regardless of current verification/password state, proves ownership via
        // OTP, and only then sets a password, flips emailVerified, and issues
        // tokens. So an abandoned signup is not a gap to patch here; it's already
        // fully and safely recoverable through Forgot Password.
        if (user != null) {
            throw new BadRequestException(
                "An account with this email already exists. Log in, or use Forgot Password to regain access.");
        }
        user = new User(null, email, request.name().trim());
        user.setEmailVerified(false);
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
        User user = userService.requireSelf(userId);
        otpService.verify(user.getEmail(), code, OtpPurpose.SIGNUP);
        user.setEmailVerified(true);
        userRepository.save(user);
        return onboardingService.describe(user);
    }

    @Transactional
    public OtpIssuedResponse resendVerifyEmail(UUID userId) {
        User user = userService.requireSelf(userId);
        if (user.isEmailVerified()) {
            throw new BadRequestException("Your email is already verified");
        }
        long expiresIn = otpService.issue(user.getEmail(), OtpPurpose.SIGNUP);
        return new OtpIssuedResponse(user.getEmail(), expiresIn, "New code sent.");
    }

    /**
     * Rotates on every use: the presented token is revoked and a fresh one is
     * returned alongside the new access token.
     *
     * <p>An already-revoked token is only forgiven when BOTH conditions hold: it was
     * revoked by a routine rotation, and that happened within REFRESH_REUSE_GRACE.
     * That pair is what makes a replay plausibly innocent — two tabs refreshing at
     * once, or a response lost on the way back.
     *
     * <p>Checking the clock alone was a real defect, caught by scenario 09 of the load
     * test failing 10 times out of 10. Detecting theft revokes every token the user
     * has, stamping each with revokedAt = now; the legitimate token the victim was
     * holding therefore looked, one millisecond later, exactly like a token that had
     * just been rotated — comfortably inside the grace window — so the very next
     * request resurrected the session the revocation had just ended. The reason is
     * now recorded alongside the timestamp, and only ROTATED is ever forgiven.
     */
    @Transactional
    public AccessTokenResponse refresh(String rawRefreshToken) {
        RefreshToken stored = refreshTokenRepository.findByTokenHash(sha256(rawRefreshToken))
            .orElseThrow(() -> new UnauthorizedException("Refresh token is not valid"));
        Instant now = Instant.now();
        if (now.isAfter(stored.getExpiresAt())) {
            throw new UnauthorizedException("Refresh token has expired. Sign in again.");
        }
        User user = stored.getUser();
        if (stored.getRevokedAt() != null) {
            // Anything other than a rotation is final: a logout must not be undone by a
            // late retry, and a token already burned for reuse must never work again.
            // Rows predating revokedReason read as null and land here too, which is the
            // safe way round.
            if (!stored.wasRotated()) {
                throw new UnauthorizedException("This session has ended. Sign in again.");
            }
            if (stored.getRevokedAt().plus(REFRESH_REUSE_GRACE).isBefore(now)) {
                // Too old to be a race, so someone is replaying a token that was already
                // spent. Burn the whole chain in its own transaction so the revocation
                // stands regardless of what the exception below does to this one.
                refreshTokenSecurity.compromiseAllForUser(user.getId());
                throw new UnauthorizedException("This session has ended. Sign in again.");
            }
            // Inside the grace window: treat it as the race it probably is and rotate again.
        } else {
            stored.setRevokedAt(now);
            stored.setRevokedReason(RefreshTokenRevocation.ROTATED);
            refreshTokenRepository.save(stored);
        }
        if (user.getAccountStatus() == Status.DELETED) {
            throw new ForbiddenException("This account has been deleted");
        }
        return new AccessTokenResponse(
            jwtService.issueUserToken(user),
            issueRefreshToken(user),
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
            token.setRevokedReason(RefreshTokenRevocation.LOGOUT);
            refreshTokenRepository.save(token);
        });
    }

    @Transactional
    public void logoutEverywhere(UUID userId) {
        refreshTokenRepository.revokeAllForUser(userId, Instant.now(), RefreshTokenRevocation.LOGOUT);
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
