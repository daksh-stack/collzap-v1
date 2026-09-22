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
 * One day's task within a {@link TaskBank}. Kept as its own indexed row rather
 * than a JSON array column so "the task for day N" is a plain lookup on every
 * scheduler tick, not a JSON unpack.
 *
 * {@code learnResource} and {@code durationLabel} are deliberately free text,
 * not a URL or a number — admin-supplied task banks describe these as things
 * like "How to set up VS Code + Git (10 min video)" and "30-60 minutes",
 * which aren't structured data and shouldn't be forced to look like it.
 */
@Entity
@Table(
    name = "task_bank_items",
    uniqueConstraints = @UniqueConstraint(name = "uk_task_bank_item_day", columnNames = {"task_bank_id", "day_index"}),
    indexes = @Index(name = "idx_task_bank_items_bank_id", columnList = "task_bank_id")
)
@Getter
@Setter
@NoArgsConstructor
public class TaskBankItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_bank_id", nullable = false)
    private TaskBank taskBank;

    @Column(name = "day_index", nullable = false)
    private int dayIndex;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "learn_resource", columnDefinition = "text")
    private String learnResource;

    @Column(name = "description", nullable = false, columnDefinition = "text")
    private String description;

    @Column(name = "submission_instructions", columnDefinition = "text")
    private String submissionInstructions;

    @Column(name = "points", nullable = false)
    private int points;

    @Column(name = "duration_label", length = 60)
    private String durationLabel;

    public TaskBankItem(
        TaskBank taskBank,
        int dayIndex,
        String title,
        String learnResource,
        String description,
        String submissionInstructions,
        int points,
        String durationLabel
    ) {
        this.taskBank = taskBank;
        this.dayIndex = dayIndex;
        this.title = title;
        this.learnResource = learnResource;
        this.description = description;
        this.submissionInstructions = submissionInstructions;
        this.points = points;
        this.durationLabel = durationLabel;
    }
}
