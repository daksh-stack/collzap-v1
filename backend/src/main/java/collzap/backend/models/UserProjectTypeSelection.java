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
 * Records that a user opted into Long-Term Peer and/or Short-Term Buddy. Both
 * can be active at once, hence a row per type rather than a column on the user.
 */
@Entity
@Table(
    name = "user_project_type_selections",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_user_project_type",
        columnNames = {"user_id", "project_type"}
    ),
    indexes = @Index(name = "idx_user_project_type_selections_user_id", columnList = "user_id")
)
@Getter
@Setter
@NoArgsConstructor
public class UserProjectTypeSelection extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "project_type", nullable = false, length = 16)
    private ProjectType projectType;

    public UserProjectTypeSelection(User user, ProjectType projectType) {
        this.user = user;
        this.projectType = projectType;
    }
}
