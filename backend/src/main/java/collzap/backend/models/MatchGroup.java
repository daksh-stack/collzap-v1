package collzap.backend.models;

import java.time.Instant;

import collzap.backend.enums.ConnectionType;
import collzap.backend.enums.MatchGroupStatus;
import collzap.backend.enums.ProjectType;
import collzap.backend.enums.SeriousnessLevel;
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
 * A match bucket, scoped to one college + interest + connection type + level
 * band. A group in WAITING is effectively the queue entry for its members; it
 * flips to ACTIVE (and gains a chat room) once enough members join.
 */
@Entity
@Table(
    name = "match_groups",
    indexes = {
        @Index(
            name = "idx_match_groups_lookup",
            columnList = "college_id, interest_id, connection_type, status"
        ),
        @Index(name = "idx_match_groups_status", columnList = "status")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class MatchGroup extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "interest_id", nullable = false)
    private Interest interest;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @Enumerated(EnumType.STRING)
    @Column(name = "connection_type", nullable = false, length = 32)
    private ConnectionType connectionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "project_type", nullable = false, length = 16)
    private ProjectType projectType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private MatchGroupStatus status = MatchGroupStatus.WAITING;

    /**
     * The level this bucket recruits around. Members are admitted within one
     * level either side of it.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "level_band", nullable = false, length = 32)
    private SeriousnessLevel levelBand;

    @Column(name = "max_members", nullable = false)
    private int maxMembers;

    /** Denormalized active-member count, kept in step by the matching service. */
    @Column(name = "member_count", nullable = false)
    private int memberCount = 0;

    @Column(name = "opened_at")
    private Instant openedAt;

    @Column(name = "closed_at")
    private Instant closedAt;

    public MatchGroup(
        Interest interest,
        College college,
        ConnectionType connectionType,
        ProjectType projectType,
        SeriousnessLevel levelBand
    ) {
        this.interest = interest;
        this.college = college;
        this.connectionType = connectionType;
        this.projectType = projectType;
        this.levelBand = levelBand;
        this.maxMembers = connectionType.capacity();
    }

    public boolean hasRoom() {
        return memberCount < maxMembers;
    }

    /** Societies are always joinable; other types stop taking members when closed. */
    public boolean acceptsNewMembers() {
        return status != MatchGroupStatus.CLOSED && hasRoom();
    }
}
