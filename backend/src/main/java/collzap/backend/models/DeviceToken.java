package collzap.backend.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Push target for match and message alerts. */
@Entity
@Table(
    name = "device_tokens",
    indexes = @Index(name = "idx_device_tokens_user_id", columnList = "user_id")
)
@Getter
@Setter
@NoArgsConstructor
public class DeviceToken extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "token", nullable = false, unique = true, length = 512)
    private String token;

    @Column(name = "platform", length = 32)
    private String platform;

    public DeviceToken(User user, String token, String platform) {
        this.user = user;
        this.token = token;
        this.platform = platform;
    }
}
