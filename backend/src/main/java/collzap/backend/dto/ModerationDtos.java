package collzap.backend.dto;

import java.time.Instant;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Privacy &amp; Safety: blocking, reporting, and the user's own block list. */
public final class ModerationDtos {

    private ModerationDtos() {
    }

    public record BlockRequest(
        @NotNull(message = "User is required")
        UUID userId
    ) {
    }

    public record ReportRequest(
        @NotNull(message = "User is required")
        UUID userId,

        @NotBlank(message = "Tell us what happened")
        @Size(max = 2000, message = "Keep it under 2000 characters")
        String reason
    ) {
    }

    public record BlockedUserResponse(
        UUID userId,
        String name,
        String profilePhotoUrl,
        Instant blockedAt
    ) {
    }
}
