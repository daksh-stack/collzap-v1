package collzap.backend.models;

import java.time.Instant;

import org.hibernate.annotations.UpdateTimestamp;

import collzap.backend.enums.Status;
import collzap.backend.enums.VerificationMethod;
import collzap.backend.enums.VerificationStatus;
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

@Entity
@Table(
    name = "users",
    indexes = {
        @Index(name = "idx_users_college_id", columnList = "college_id"),
        @Index(name = "idx_users_email", columnList = "email")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class User extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "college_id", nullable = true)
    private College college;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "name", nullable = false)
    private String name;

    /** Null means no password set yet — a legacy pre-password account, or an abandoned signup. */
    @Column(name = "password_hash")
    private String passwordHash;

    /**
     * Whether the login email itself has been confirmed. Pre-existing accounts (created
     * under the old college-email-OTP flow) default to true via the column's DB default —
     * they proved email ownership already, they just never set a password.
     */
    @Column(name = "email_verified", nullable = false, columnDefinition = "boolean default true")
    private boolean emailVerified = true;

    /** How verification was actually satisfied. Null until either method is engaged. */
    @Enumerated(EnumType.STRING)
    @Column(name = "verification_method", length = 32)
    private VerificationMethod verificationMethod;

    // ---- Profile setup ----

    @Column(name = "profile_photo_url", length = 1000)
    private String profilePhotoUrl;

    @Column(name = "year_of_study")
    private Integer yearOfStudy;

    @Column(name = "city")
    private String city;

    /** One thing I want to achieve in college years. */
    @Column(name = "story_prompt_1", columnDefinition = "text")
    private String storyPrompt1;

    /** I am most serious about. */
    @Column(name = "story_prompt_2", columnDefinition = "text")
    private String storyPrompt2;

    /** The kind of peer I am looking for. */
    @Column(name = "story_prompt_3", columnDefinition = "text")
    private String storyPrompt3;

    @Column(name = "proof_of_work_url", length = 1000)
    private String proofOfWorkUrl;

    @Column(name = "profile_completed", nullable = false)
    private boolean profileCompleted = false;

    // ---- Verification ----

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 32)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(name = "rejection_reason", columnDefinition = "text")
    private String rejectionReason;

    // ---- Settings ----

    @Column(name = "notifications_enabled", nullable = false)
    private boolean notificationsEnabled = true;

    /** Privacy and Safety: hides the profile from other users' Circle views. */
    @Column(name = "profile_visible", nullable = false)
    private boolean profileVisible = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false, length = 16)
    private Status accountStatus = Status.ACTIVE;

    @Column(name = "last_seen_at")
    private Instant lastSeenAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    public User(College college, String email, String name) {
        this.college = college;
        this.email = email;
        this.name = name;
    }

    public boolean isVerified() {
        return verificationStatus == VerificationStatus.APPROVED;
    }

    public boolean hasPassword() {
        return passwordHash != null;
    }

    public boolean isActive() {
        return accountStatus == Status.ACTIVE;
    }

    /**
     * Mandatory profile fields per the setup screen: photo, name, college, year,
     * city and all three story prompts. The proof-of-work link stays optional.
     */
    public int profileCompletionPercent() {
        int total = 8;
        int filled = 0;
        if (isNotBlank(profilePhotoUrl)) filled++;
        if (isNotBlank(name)) filled++;
        if (college != null) filled++;
        if (yearOfStudy != null) filled++;
        if (isNotBlank(city)) filled++;
        if (isNotBlank(storyPrompt1)) filled++;
        if (isNotBlank(storyPrompt2)) filled++;
        if (isNotBlank(storyPrompt3)) filled++;
        return filled * 100 / total;
    }

    private static boolean isNotBlank(String value) {
        return value != null && !value.isBlank();
    }
}
