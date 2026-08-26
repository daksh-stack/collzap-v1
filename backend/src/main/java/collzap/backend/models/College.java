package collzap.backend.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A college, keyed for matching purposes by its email domain. A signup email's
 * domain decides which college the user is placed in.
 */
@Entity
@Table(name = "colleges")
@Getter
@Setter
@NoArgsConstructor
public class College extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    /** Bare domain, lowercased, e.g. {@code iitb.ac.in}. */
    @Column(name = "email_domain", nullable = false, unique = true)
    private String emailDomain;

    @Column(name = "city")
    private String city;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    public College(String name, String emailDomain, String city) {
        this.name = name;
        this.emailDomain = emailDomain;
        this.city = city;
    }
}
