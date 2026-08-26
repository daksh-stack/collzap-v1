package collzap.backend.models;

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
 * Freezes the randomized question order for a sitting so the progress bar
 * ("Question 7 of 25") stays stable across reloads, and so a resumed test shows
 * the same paper.
 */
@Entity
@Table(
    name = "seriousness_test_session_questions",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_session_question_order",
        columnNames = {"session_id", "order_index"}
    ),
    indexes = @Index(name = "idx_session_questions_session_id", columnList = "session_id")
)
@Getter
@Setter
@NoArgsConstructor
public class SeriousnessTestSessionQuestion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private SeriousnessTestSession session;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_id", nullable = false)
    private SeriousnessTestAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private SeriousnessTestQuestion question;

    /** Zero-based position in the 25-question run. */
    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    public SeriousnessTestSessionQuestion(
        SeriousnessTestSession session,
        SeriousnessTestAttempt attempt,
        SeriousnessTestQuestion question,
        int orderIndex
    ) {
        this.session = session;
        this.attempt = attempt;
        this.question = question;
        this.orderIndex = orderIndex;
    }
}
