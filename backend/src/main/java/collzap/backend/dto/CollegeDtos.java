package collzap.backend.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import collzap.backend.enums.DocumentStatus;
import collzap.backend.enums.DocumentType;
import collzap.backend.enums.VerificationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
        String documentUrl
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
        List<VerificationDocumentResponse> documents
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
