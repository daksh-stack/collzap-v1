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
 * One MCQ in the randomized question bank for an interest. Every option carries its
 * own point value — points are never serialized to clients, only option text is;
 * scoring happens server-side only.
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
    private List<QuestionOption> options = new ArrayList<>();

    @Column(name = "active", nullable = false)
    private boolean active = true;

    public SeriousnessTestQuestion(Interest interest, String questionText, List<QuestionOption> options) {
        this.interest = interest;
        this.questionText = questionText;
        this.options = options;
    }

    /** The most points a single option on this question is worth — this question's share of a paper's denominator. */
    public int maxPoints() {
        return options.stream().mapToInt(QuestionOption::points).max().orElse(0);
    }
}
