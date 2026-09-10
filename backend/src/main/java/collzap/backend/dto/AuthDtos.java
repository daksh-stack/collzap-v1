package collzap.backend.dto;

import collzap.backend.enums.AdminRole;
import collzap.backend.enums.OnboardingStep;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record SignupRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email")
        @Size(max = 254)
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 72, message = "Password must be 8 to 72 characters")
        String password,

        @NotBlank(message = "Name is required")
        @Size(max = 120, message = "Name must be at most 120 characters")
        String name
    ) {
    }

    public record LoginRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email")
        String email,

        @NotBlank(message = "Password is required")
        String password
    ) {
    }

    public record ForgotPasswordRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email")
        String email
    ) {
    }

    public record ResetPasswordRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email")
        String email,

        @NotBlank(message = "Enter the code we emailed you")
        @Pattern(regexp = "\\d{4,8}", message = "The code must be 4 to 8 digits")
        String code,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 72, message = "Password must be 8 to 72 characters")
        String newPassword
    ) {
    }

    public record VerifyEmailRequest(
        @NotBlank(message = "Enter the code we emailed you")
        @Pattern(regexp = "\\d{4,8}", message = "The code must be 4 to 8 digits")
        String code
    ) {
    }

    /** "We sent a code" acknowledgement shared by forgot-password and college-email verification. */
    public record OtpIssuedResponse(
        String email,
        long expiresInSeconds,
        String message
    ) {
    }

    public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresInSeconds,
        OnboardingStep nextStep,
        UserDtos.UserResponse user
    ) {
    }

    /** Mirrors AuthResponse but also carries how long the just-issued signup verification code lives. */
    public record SignupResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresInSeconds,
        OnboardingStep nextStep,
        UserDtos.UserResponse user,
        long otpExpiresInSeconds
    ) {
    }

    public record RefreshTokenRequest(
        @NotBlank(message = "Refresh token is required")
        String refreshToken
    ) {
    }

    public record AccessTokenResponse(
        String accessToken,
        String tokenType,
        long expiresInSeconds
    ) {
    }

    public record AdminLoginRequest(
        @NotBlank(message = "Username is required")
        String username,

        @NotBlank(message = "Password is required")
        String password
    ) {
    }

    public record AdminAuthResponse(
        String accessToken,
        String tokenType,
        long expiresInSeconds,
        String username,
        AdminRole role
    ) {
    }
}
