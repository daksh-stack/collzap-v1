package collzap.backend.models;

import java.time.Instant;

import collzap.backend.enums.DocumentStatus;
import collzap.backend.enums.DocumentType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A fee slip or ID card upload awaiting manual admin review. */
@Entity
@Table(
    name = "verification_documents",
    indexes = {
        @Index(name = "idx_verification_documents_user_id", columnList = "user_id"),
        @Index(name = "idx_verification_documents_status", columnList = "status")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class VerificationDocument extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 32)
    private DocumentType documentType;

    @Column(name = "document_url", nullable = false, length = 1000)
    private String documentUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private DocumentStatus status = DocumentStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private AdminUser reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "review_note", columnDefinition = "text")
    private String reviewNote;

    public VerificationDocument(User user, DocumentType documentType, String documentUrl) {
        this.user = user;
        this.documentType = documentType;
        this.documentUrl = documentUrl;
    }
}
