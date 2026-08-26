package collzap.backend.models;

import java.time.Instant;

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
 * One sitting of the test. Holds the 25 questions spread across the user's
 * long-term interests plus the silent background timer that auto-submits.
 *
 * <p>Not in the original ERD: the ERD models attempts per interest, but the test
 * is a single 25-question run over both interests with one shared timer and one
 * shared progress bar, so the sitting needs its own row to group the attempts.
 */
@Entity
@Table(
    name = "seriousness_test_sessions",
    indexes = @Index(name = "idx_test_sessions_user_id", columnList = "user_id")
)
@Getter
@Setter
@NoArgsConstructor
public class SeriousnessTestSession extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "total_questions", nullable = false)
    private int totalQuestions;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    /** Auto-submit deadline. Never surfaced to the client — the timer is silent. */
    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private TestAttemptStatus status = TestAttemptStatus.IN_PROGRESS;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    /** True when the deadline elapsed and the server closed the sitting. */
    @Column(name = "auto_submitted", nullable = false)
    private boolean autoSubmitted = false;

    public SeriousnessTestSession(User user, int totalQuestions, Instant startedAt, Instant expiresAt) {
        this.user = user;
        this.totalQuestions = totalQuestions;
        this.startedAt = startedAt;
        this.expiresAt = expiresAt;
    }

    public boolean isExpired(Instant now) {
        return now.isAfter(expiresAt);
    }
}
