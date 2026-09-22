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
 * One day's task as it actually landed for one group. {@code matchGroupId}
 * and {@code dayIndex} are denormalized off {@link GroupTaskProgress} purely
 * so "today's assignment for group X" is a single indexed lookup rather than
 * a join through progress.
 *
 * The unique constraint on (groupTaskProgress, dayIndex) is a deliberate
 * second line of defense: {@link GroupTaskProgress#lastAssignedDate} is the
 * primary guard against the scheduler double-assigning a day, but if that
 * check is ever bypassed (a retried tick, a manual admin trigger racing the
 * scheduled one) this constraint turns a would-be duplicate into a harmless,
 * loggable failure instead of a second assignment.
 */
@Entity
@Table(
    name = "task_assignments",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_task_assignment_progress_day",
        columnNames = {"group_task_progress_id", "day_index"}
    ),
    indexes = {
        @Index(name = "idx_task_assignments_group_id", columnList = "match_group_id"),
        @Index(name = "idx_task_assignments_progress_id", columnList = "group_task_progress_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class TaskAssignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_task_progress_id", nullable = false)
    private GroupTaskProgress groupTaskProgress;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_bank_item_id", nullable = false)
    private TaskBankItem taskBankItem;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "match_group_id", nullable = false)
    private MatchGroup matchGroup;

    @Column(name = "day_index", nullable = false)
    private int dayIndex;

    @Column(name = "assigned_at", nullable = false)
    private Instant assignedAt;

    public TaskAssignment(
        GroupTaskProgress groupTaskProgress,
        TaskBankItem taskBankItem,
        MatchGroup matchGroup,
        int dayIndex,
        Instant assignedAt
    ) {
        this.groupTaskProgress = groupTaskProgress;
        this.taskBankItem = taskBankItem;
        this.matchGroup = matchGroup;
        this.dayIndex = dayIndex;
        this.assignedAt = assignedAt;
    }
}
