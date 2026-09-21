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

/**
 * A "bring CollZap to my college" submission from someone at a college that
 * isn't onboarded yet — so, unlike {@link VerificationDocument}, there is no
 * {@link User} and no {@link College} row to attach to. Everything about the
 * applicant and the college they're claiming is captured as free text; an
 * admin who approves it is expected to create the real College row themselves.
 */
@Entity
@Table(
    name = "college_applications",
    indexes = {
        @Index(name = "idx_college_applications_status", columnList = "status"),
        @Index(name = "idx_college_applications_email", columnList = "email")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class CollegeApplication extends BaseEntity {

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "contact_number", nullable = false, length = 20)
    private String contactNumber;

    @Column(name = "college_name", nullable = false, length = 200)
    private String collegeName;

    @Column(name = "college_city", length = 120)
    private String collegeCity;

    @Column(name = "motivation", nullable = false, columnDefinition = "text")
    private String motivation;

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

    public CollegeApplication(
        String fullName,
        String email,
        String contactNumber,
        String collegeName,
        String collegeCity,
        String motivation,
        DocumentType documentType,
        String documentUrl
    ) {
        this.fullName = fullName;
        this.email = email;
        this.contactNumber = contactNumber;
        this.collegeName = collegeName;
        this.collegeCity = collegeCity;
        this.motivation = motivation;
        this.documentType = documentType;
        this.documentUrl = documentUrl;
    }
}
