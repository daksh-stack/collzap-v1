package collzap.backend.models;

import collzap.backend.enums.ProjectType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
 * One interest a user picked, scoped to the project type it was picked under.
 * Capped at 2 rows for long-term and 1 for short-term.
 */
@Entity
@Table(
    name = "user_interest_selections",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_user_interest_selection",
        columnNames = {"user_id", "interest_id", "project_type"}
    ),
    indexes = {
        @Index(name = "idx_user_interest_selections_user_id", columnList = "user_id"),
        @Index(name = "idx_user_interest_selections_interest_id", columnList = "interest_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class UserInterestSelection extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "interest_id", nullable = false)
    private Interest interest;

    @Enumerated(EnumType.STRING)
    @Column(name = "project_type", nullable = false, length = 16)
    private ProjectType projectType;

    /** Optional free-text refinement, capped at 30 characters. */
    @Column(name = "sub_tag", length = 30)
    private String subTag;

    public UserInterestSelection(User user, Interest interest, ProjectType projectType, String subTag) {
        this.user = user;
        this.interest = interest;
        this.projectType = projectType;
        this.subTag = subTag;
    }
}
