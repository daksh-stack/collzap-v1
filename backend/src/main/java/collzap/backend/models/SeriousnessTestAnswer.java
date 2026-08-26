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

@Entity
@Table(
    name = "seriousness_test_answers",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_answer_attempt_question",
        columnNames = {"attempt_id", "question_id"}
    ),
    indexes = @Index(name = "idx_test_answers_attempt_id", columnList = "attempt_id")
)
@Getter
@Setter
@NoArgsConstructor
public class SeriousnessTestAnswer extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_id", nullable = false)
    private SeriousnessTestAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private SeriousnessTestQuestion question;

    @Column(name = "selected_option_index", nullable = false)
    private int selectedOptionIndex;

    @Column(name = "is_correct", nullable = false)
    private boolean correct;

    public SeriousnessTestAnswer(
        SeriousnessTestAttempt attempt,
        SeriousnessTestQuestion question,
        int selectedOptionIndex,
        boolean correct
    ) {
        this.attempt = attempt;
        this.question = question;
        this.selectedOptionIndex = selectedOptionIndex;
        this.correct = correct;
    }
}
