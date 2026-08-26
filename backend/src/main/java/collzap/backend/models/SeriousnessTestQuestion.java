package collzap.backend.models;

import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One MCQ in the randomized question bank for an interest. The correct index is
 * never serialized to clients — scoring happens server-side only.
 */
@Entity
@Table(
    name = "seriousness_test_questions",
    indexes = @Index(name = "idx_test_questions_interest_id", columnList = "interest_id")
)
@Getter
@Setter
@NoArgsConstructor
public class SeriousnessTestQuestion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "interest_id", nullable = false)
    private Interest interest;

    @Column(name = "question_text", nullable = false, columnDefinition = "text")
    private String questionText;

    /** Exactly four options, stored as a JSON array. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "options", nullable = false)
    private List<String> options = new ArrayList<>();

    @Column(name = "correct_option_index", nullable = false)
    private int correctOptionIndex;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    public SeriousnessTestQuestion(Interest interest, String questionText, List<String> options, int correctOptionIndex) {
        this.interest = interest;
        this.questionText = questionText;
        this.options = options;
        this.correctOptionIndex = correctOptionIndex;
    }
}
