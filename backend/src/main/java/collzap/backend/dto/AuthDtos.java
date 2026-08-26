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

    /**
     * Signup and login share the OTP request endpoint: the college email decides
     * the college, and whether an account already exists decides the flow.
     */
    public record RequestOtpRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid college email")
        @Size(max = 254)
        String email,

        /** Optional on signup; ignored when the account already exists. */
        @Size(max = 120, message = "Name must be at most 120 characters")
        String name
    ) {
    }

    public record OtpSentResponse(
        String email,
        String collegeName,
        boolean existingAccount,
        long expiresInSeconds,
        String message
    ) {
    }

    public record VerifyOtpRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid college email")
        String email,

        @NotBlank(message = "Enter the code we emailed you")
        @Pattern(regexp = "\\d{4,8}", message = "The code must be 4 to 8 digits")
        String code,

        /** Used only when creating a brand new account. */
        @Size(max = 120)
        String name
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
