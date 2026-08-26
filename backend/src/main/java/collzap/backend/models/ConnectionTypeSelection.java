package collzap.backend.models;

import collzap.backend.enums.ConnectionType;
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
 * The single connection type (1-on-1, short group, society) that applies to all
 * of a user's interests within one project type.
 *
 * <p>Scoped per project type rather than per user because Society is long-term
 * only — a user running both modes needs a valid short-term type as well.
 */
@Entity
@Table(
    name = "connection_type_selections",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_connection_type_user_project",
        columnNames = {"user_id", "project_type"}
    ),
    indexes = @Index(name = "idx_connection_type_selections_user_id", columnList = "user_id")
)
@Getter
@Setter
@NoArgsConstructor
public class ConnectionTypeSelection extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "project_type", nullable = false, length = 16)
    private ProjectType projectType;

    @Enumerated(EnumType.STRING)
    @Column(name = "connection_type", nullable = false, length = 32)
    private ConnectionType connectionType;

    public ConnectionTypeSelection(User user, ProjectType projectType, ConnectionType connectionType) {
        this.user = user;
        this.projectType = projectType;
        this.connectionType = connectionType;
    }
}
