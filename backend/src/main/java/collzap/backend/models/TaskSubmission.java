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
 * One member's submission for one assignment. No editing in v1 — the row is
 * write-once; a mistake means asking an admin, not a fast-follow gap we hit
 * by accident. {@code fileUrl} is optional: text and/or a link is a complete
 * submission on its own, matching how most of these tasks are described.
 */
@Entity
@Table(
    name = "task_submissions",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_task_submission_assignment_user",
        columnNames = {"task_assignment_id", "user_id"}
    ),
    indexes = @Index(name = "idx_task_submissions_assignment_id", columnList = "task_assignment_id")
)
@Getter
@Setter
@NoArgsConstructor
public class TaskSubmission extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_assignment_id", nullable = false)
    private TaskAssignment taskAssignment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "content_text", columnDefinition = "text")
    private String contentText;

    @Column(name = "link_url", length = 1000)
    private String linkUrl;

    @Column(name = "file_url", length = 1000)
    private String fileUrl;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;

    public TaskSubmission(TaskAssignment taskAssignment, User user, String contentText, String linkUrl, String fileUrl, Instant submittedAt) {
        this.taskAssignment = taskAssignment;
        this.user = user;
        this.contentText = contentText;
        this.linkUrl = linkUrl;
        this.fileUrl = fileUrl;
        this.submittedAt = submittedAt;
    }
}
