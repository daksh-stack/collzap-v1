package collzap.backend.models;

import collzap.backend.enums.ModerationAction;
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
 * A block or a report raised by one user against another. Blocks are consulted
 * by the matching service so blocked pairs are never placed together.
 */
@Entity
@Table(
    name = "blocks_reports",
    indexes = {
        @Index(name = "idx_blocks_reports_reporter", columnList = "reporter_id, action_type"),
        @Index(name = "idx_blocks_reports_reported", columnList = "reported_id, action_type")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class BlockReport extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reported_id", nullable = false)
    private User reported;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false, length = 16)
    private ModerationAction actionType;

    @Column(name = "reason", columnDefinition = "text")
    private String reason;

    public BlockReport(User reporter, User reported, ModerationAction actionType, String reason) {
        this.reporter = reporter;
        this.reported = reported;
        this.actionType = actionType;
        this.reason = reason;
    }
}
