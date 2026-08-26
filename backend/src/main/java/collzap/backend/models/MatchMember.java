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

@Entity
@Table(
    name = "match_members",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_match_member",
        columnNames = {"match_group_id", "user_id"}
    ),
    indexes = {
        @Index(name = "idx_match_members_user_id", columnList = "user_id"),
        @Index(name = "idx_match_members_group_id", columnList = "match_group_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class MatchMember extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "match_group_id", nullable = false)
    private MatchGroup matchGroup;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt;

    /** Cleared on unmatch; the row is kept for admin history. */
    @Column(name = "active", nullable = false)
    private boolean active = true;

    @Column(name = "left_at")
    private Instant leftAt;

    public MatchMember(MatchGroup matchGroup, User user, Instant joinedAt) {
        this.matchGroup = matchGroup;
        this.user = user;
        this.joinedAt = joinedAt;
    }
}
