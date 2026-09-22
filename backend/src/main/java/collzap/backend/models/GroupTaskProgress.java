package collzap.backend.models;

import java.time.LocalDate;

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
 * One match group's own clock through its pinned {@link TaskBank}. Day 1 is
 * relative to whenever this row was created, not a shared calendar date — a
 * group that opens on the bank's "day 15" still starts at its own day 1.
 *
 * {@code taskBankId} is captured once and never changes, even if an admin
 * later replaces the interest's active bank; {@code currentDayIndex} only
 * advances on days the group is ACTIVE, so a ONE_ON_ONE group that drops back
 * to WAITING (partner left) simply stops advancing and resumes exactly where
 * it left off once it reopens.
 */
@Entity
@Table(
    name = "group_task_progress",
    indexes = @Index(name = "idx_group_task_progress_group_id", columnList = "match_group_id", unique = true)
)
@Getter
@Setter
@NoArgsConstructor
public class GroupTaskProgress extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "match_group_id", nullable = false, unique = true)
    private MatchGroup matchGroup;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_bank_id", nullable = false)
    private TaskBank taskBank;

    /** 0 means no day has been assigned yet. */
    @Column(name = "current_day_index", nullable = false)
    private int currentDayIndex = 0;

    /** IST calendar date of the last assignment; guards against a scheduler tick firing twice in one day. */
    @Column(name = "last_assigned_date")
    private LocalDate lastAssignedDate;

    /** Set once the bank runs out of days for this group. No wraparound, no repeat. */
    @Column(name = "completed_at")
    private java.time.Instant completedAt;

    public GroupTaskProgress(MatchGroup matchGroup, TaskBank taskBank) {
        this.matchGroup = matchGroup;
        this.taskBank = taskBank;
    }
}
