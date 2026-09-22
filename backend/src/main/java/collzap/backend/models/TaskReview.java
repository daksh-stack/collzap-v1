package collzap.backend.models;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One reviewer's take on one submission. Any active group member may review
 * any other member's submission — there is no fixed pairing, which is what
 * lets this work the same at 2 people or 40. The service layer (not the
 * schema) rejects a reviewer reviewing their own submission; the unique
 * constraint here only stops the SAME reviewer reviewing the SAME submission
 * twice.
 */
@Entity
@Table(
    name = "task_reviews",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_task_review_submission_reviewer",
        columnNames = {"submission_id", "reviewer_user_id"}
    ),
    indexes = @Index(name = "idx_task_reviews_submission_id", columnList = "submission_id")
)
@Getter
@Setter
@NoArgsConstructor
public class TaskReview extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false)
    private TaskSubmission submission;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reviewer_user_id", nullable = false)
    private User reviewer;

    /** Four 1-5 scores mirroring the source plan's own review criteria. */
    @Column(name = "completion_score", nullable = false)
    private int completionScore;

    @Column(name = "quality_score", nullable = false)
    private int qualityScore;

    @Column(name = "learning_score", nullable = false)
    private int learningScore;

    @Column(name = "effort_score", nullable = false)
    private int effortScore;

    @Column(name = "feedback_text", columnDefinition = "text")
    private String feedbackText;

    @Column(name = "reviewed_at", nullable = false)
    private Instant reviewedAt;

    public TaskReview(
        TaskSubmission submission,
        User reviewer,
        int completionScore,
        int qualityScore,
        int learningScore,
        int effortScore,
        String feedbackText,
        Instant reviewedAt
    ) {
        this.submission = submission;
        this.reviewer = reviewer;
        this.completionScore = completionScore;
        this.qualityScore = qualityScore;
        this.learningScore = learningScore;
        this.effortScore = effortScore;
        this.feedbackText = feedbackText;
        this.reviewedAt = reviewedAt;
    }
}
