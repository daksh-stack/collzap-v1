package collzap.backend.models;

import java.time.Instant;
import java.time.LocalDate;

import collzap.backend.enums.SeriousnessLevel;
import collzap.backend.enums.TestAttemptStatus;
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
 * The per-interest slice of a sitting. Carries the score, the resulting level
 * tag and the 30-day retake lock date.
 */
@Entity
@Table(
    name = "seriousness_test_attempts",
    indexes = {
        @Index(name = "idx_test_attempts_user_id", columnList = "user_id"),
        @Index(name = "idx_test_attempts_user_interest", columnList = "user_id, interest_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class SeriousnessTestAttempt extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "interest_id", nullable = false)
    private Interest interest;

    /** How many of the 25 questions were allotted to this interest. */
    @Column(name = "question_count", nullable = false)
    private int questionCount;

    @Column(name = "correct_count", nullable = false)
    private int correctCount = 0;

    /** Percentage, 0-100. Null until submitted. */
    @Column(name = "score")
    private Integer score;

    @Enumerated(EnumType.STRING)
    @Column(name = "level", length = 32)
    private SeriousnessLevel level;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private TestAttemptStatus status = TestAttemptStatus.IN_PROGRESS;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "next_retake_date")
    private LocalDate nextRetakeDate;

    public SeriousnessTestAttempt(User user, Interest interest, int questionCount) {
        this.user = user;
        this.interest = interest;
        this.questionCount = questionCount;
    }
}
