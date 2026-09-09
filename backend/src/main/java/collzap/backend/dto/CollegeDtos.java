package collzap.backend.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import collzap.backend.enums.DocumentStatus;
import collzap.backend.enums.DocumentType;
import collzap.backend.enums.VerificationMethod;
import collzap.backend.enums.VerificationStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class CollegeDtos {

    private CollegeDtos() {
    }

    public record CollegeResponse(UUID id, String name, String emailDomain, String city) {
    }

    public record CreateCollegeRequest(
        @NotBlank(message = "College name is required")
        @Size(max = 200)
        String name,

        @NotBlank(message = "Email domain is required")
        @Size(max = 200)
        String emailDomain,

        @Size(max = 120)
        String city
    ) {
    }

    public record UploadDocumentRequest(
        @NotNull(message = "Document type is required")
        DocumentType documentType,

        @NotBlank(message = "Document URL is required")
        @Size(max = 1000)
        String documentUrl,

        @NotNull(message = "College is required")
        UUID collegeId
    ) {
    }

    public record RequestCollegeEmailOtpRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid college email")
        @Size(max = 254)
        String email
    ) {
    }

    public record ConfirmCollegeEmailOtpRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid college email")
        String email,

        @NotBlank(message = "Enter the code we emailed you")
        @Pattern(regexp = "\\d{4,8}", message = "The code must be 4 to 8 digits")
        String code
    ) {
    }

    public record CollegeEmailOtpSentResponse(
        String email,
        String collegeName,
        long expiresInSeconds
    ) {
    }

    public record VerificationDocumentResponse(
        UUID id,
        DocumentType documentType,
        String documentUrl,
        DocumentStatus status,
        String reviewNote,
        Instant createdAt,
        Instant reviewedAt
    ) {
    }

    public record VerificationStatusResponse(
        VerificationStatus status,
        String message,
        boolean canUploadDocument,
        List<VerificationDocumentResponse> documents,
        VerificationMethod method
    ) {
    }

    public record ReviewDocumentRequest(
        @NotNull(message = "Specify whether the document is approved")
        Boolean approve,

        @Size(max = 500)
        String note
    ) {
    }
}
