package collzap.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import collzap.backend.dto.AuthDtos.AccessTokenResponse;
import collzap.backend.dto.AuthDtos.AuthResponse;
import collzap.backend.dto.AuthDtos.OtpSentResponse;
import collzap.backend.dto.AuthDtos.RefreshTokenRequest;
import collzap.backend.dto.AuthDtos.RequestOtpRequest;
import collzap.backend.dto.AuthDtos.VerifyOtpRequest;
import collzap.backend.dto.CommonDtos.MessageResponse;
import collzap.backend.ratelimit.RateLimited;
import collzap.backend.service.AuthService;
import jakarta.validation.Valid;

/**
 * Signup, login and token lifecycle. Everything here is reachable without a
 * token, which is why nothing on it takes a user id from the caller.
 *
 * <p>Signup and login are the same two calls: request a code for a college email,
 * then exchange the code for tokens. {@code existingAccount} on the OTP response
 * tells the client which copy to show.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** Emails a one-time code to a recognised college address. */
    @RateLimited(name = "otp-request", limit = 10, windowSeconds = 3600, keyType = RateLimited.KeyType.IP)
    @PostMapping("/otp")
    public OtpSentResponse requestOtp(@Valid @RequestBody RequestOtpRequest request) {
        return authService.requestOtp(request);
    }

    /** Verifies the code, creating the account on first use, and issues tokens. */
    @RateLimited(name = "otp-verify", limit = 20, windowSeconds = 3600, keyType = RateLimited.KeyType.IP)
    @PostMapping("/otp/verify")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        AuthResponse response = authService.verifyOtp(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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
