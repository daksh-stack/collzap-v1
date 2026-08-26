package collzap.backend.models;

import collzap.backend.enums.InterestCategory;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Catalogue entry for the 16 long-term interests and the 7 short-term
 * activities. The category keeps the two grids separate.
 */
@Entity
@Table(
    name = "interests",
    uniqueConstraints = @UniqueConstraint(name = "uk_interests_name_category", columnNames = {"name", "category"}),
    indexes = @Index(name = "idx_interests_category", columnList = "category")
)
@Getter
@Setter
@NoArgsConstructor
public class Interest extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 16)
    private InterestCategory category;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    public Interest(String name, InterestCategory category, int displayOrder) {
        this.name = name;
        this.category = category;
        this.displayOrder = displayOrder;
    }
}
