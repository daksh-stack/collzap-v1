package collzap.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import collzap.backend.dto.AuthDtos.AccessTokenResponse;
import collzap.backend.dto.AuthDtos.AuthResponse;
import collzap.backend.dto.AuthDtos.ForgotPasswordRequest;
import collzap.backend.dto.AuthDtos.LoginRequest;
import collzap.backend.dto.AuthDtos.OtpIssuedResponse;
import collzap.backend.dto.AuthDtos.RefreshTokenRequest;
import collzap.backend.dto.AuthDtos.ResetPasswordRequest;
import collzap.backend.dto.AuthDtos.SignupRequest;
import collzap.backend.dto.AuthDtos.SignupResponse;
import collzap.backend.dto.CommonDtos.MessageResponse;
import collzap.backend.ratelimit.RateLimited;
import collzap.backend.service.AuthService;
import jakarta.validation.Valid;

/**
 * Signup, login, forgot-password and token lifecycle. Everything here is
 * reachable without a token, which is why nothing on it takes a user id from
 * the caller.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** Creates the account and issues tokens right away; email verification happens in onboarding. */
    @RateLimited(name = "signup", limit = 10, windowSeconds = 3600, keyType = RateLimited.KeyType.IP)
    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.signup(request));
    }

    @RateLimited(name = "login", limit = 10, windowSeconds = 3600, keyType = RateLimited.KeyType.IP)
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /** Emails a reset code if the address has an account. */
    @RateLimited(name = "forgot-password", limit = 5, windowSeconds = 3600, keyType = RateLimited.KeyType.IP)
    @PostMapping("/forgot-password")
    public OtpIssuedResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return authService.forgotPassword(request);
    }

    /** Also doubles as "set your first password" for pre-existing no-password accounts. */
    @RateLimited(name = "reset-password", limit = 10, windowSeconds = 3600, keyType = RateLimited.KeyType.IP)
    @PostMapping("/reset-password")
    public AuthResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request);
    }

    /** Trades a refresh token for a fresh access token. */
    @PostMapping("/refresh")
    public AccessTokenResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refresh(request.refreshToken());
    }

    /** Revokes one refresh token. Idempotent, so a stale token is not an error. */
    @PostMapping("/logout")
    public MessageResponse logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request.refreshToken());
        return MessageResponse.of("Signed out");
    }
}
