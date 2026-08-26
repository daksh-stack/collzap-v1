package collzap.backend.models;

import java.time.Instant;

import collzap.backend.enums.OtpPurpose;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A one-time code emailed to a college address. Only the hash is stored, so a
 * database leak does not hand out live codes.
 */
@Entity
@Table(
    name = "otp_codes",
    indexes = @Index(name = "idx_otp_codes_email", columnList = "email")
)
@Getter
@Setter
@NoArgsConstructor
public class OtpCode extends BaseEntity {

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "code_hash", nullable = false)
    private String codeHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "purpose", nullable = false, length = 16)
    private OtpPurpose purpose;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "consumed_at")
    private Instant consumedAt;

    @Column(name = "attempts", nullable = false)
    private int attempts = 0;

    public OtpCode(String email, String codeHash, OtpPurpose purpose, Instant expiresAt) {
        this.email = email;
        this.codeHash = codeHash;
        this.purpose = purpose;
        this.expiresAt = expiresAt;
    }

    public boolean isUsable(Instant now) {
        return consumedAt == null && now.isBefore(expiresAt);
    }
}
