package collzap.backend.dto;

import java.time.Instant;
import java.util.UUID;

import collzap.backend.enums.DocumentStatus;
import collzap.backend.enums.DocumentType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class CollegeApplicationDtos {

    private CollegeApplicationDtos() {
    }

    /**
     * Sizes on collegeName/collegeCity deliberately match CreateCollegeRequest
     * so an admin approving this can hand the same strings straight to
     * CollegeService.create without hitting a validation error that only shows
     * up at the second step.
     */
    public record SubmitCollegeApplicationRequest(
        @NotBlank(message = "Your name is required")
        @Size(max = 120)
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email")
        @Size(max = 254)
        String email,

        @NotBlank(message = "A contact number is required")
        @Pattern(regexp = "\\+?\\d{10,13}", message = "Enter a valid phone number")
        String contactNumber,

        @NotBlank(message = "College name is required")
        @Size(max = 200)
        String collegeName,

        @Size(max = 120)
        String collegeCity,

        @NotBlank(message = "Tell us why you want CollZap at your college")
        @Size(min = 30, max = 1000, message = "A few sentences helps — between 30 and 1000 characters")
        String motivation,

        @NotNull(message = "Document type is required")
        DocumentType documentType,

        @NotBlank(message = "A document is required")
        @Size(max = 1000)
        String documentUrl
    ) {
    }

    public record CollegeApplicationAck(
        UUID id,
        String message
    ) {
    }

    public record AdminCollegeApplicationRow(
        UUID id,
        String fullName,
        String email,
        String contactNumber,
        String collegeName,
        String collegeCity,
        String motivation,
        DocumentType documentType,
        String documentUrl,
        DocumentStatus status,
        String reviewNote,
        String reviewedByUsername,
        Instant reviewedAt,
        Instant createdAt
    ) {
    }
}
