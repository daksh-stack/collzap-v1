package collzap.backend.models;

import collzap.backend.enums.ProjectType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Backs the "Can't find your interest?" feedback link on the interest grid. */
@Entity
@Table(name = "interest_feedback")
@Getter
@Setter
@NoArgsConstructor
public class InterestFeedback extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "project_type", nullable = false, length = 16)
    private ProjectType projectType;

    @Column(name = "suggestion", nullable = false, length = 200)
    private String suggestion;

    public InterestFeedback(User user, ProjectType projectType, String suggestion) {
        this.user = user;
        this.projectType = projectType;
        this.suggestion = suggestion;
    }
}
