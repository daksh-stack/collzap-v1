package collzap.backend.models;

import collzap.backend.enums.AdminRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Operator account for the /admin dashboard. Separate from {@link User}. */
@Entity
@Table(name = "admin_users")
@Getter
@Setter
@NoArgsConstructor
public class AdminUser extends BaseEntity {

    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 32)
    private AdminRole role = AdminRole.ADMIN;

    public AdminUser(String username, String passwordHash, AdminRole role) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
    }
}
