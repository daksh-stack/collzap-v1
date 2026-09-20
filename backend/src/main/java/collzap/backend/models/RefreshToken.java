package collzap.backend.models;

import java.time.Instant;

import collzap.backend.enums.RefreshTokenRevocation;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Opaque refresh token, stored hashed and revocable on logout or deletion. */
@Entity
@Table(
    name = "refresh_tokens",
    indexes = {
        @Index(name = "idx_refresh_tokens_token_hash", columnList = "token_hash"),
        @Index(name = "idx_refresh_tokens_user_id", columnList = "user_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class RefreshToken extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "token_hash", nullable = false, unique = true)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    /**
     * Null while the token is live. Once set, {@code revokedAt} alone cannot say
     * whether a replay is innocent, so the reason is what the refresh path reads
     * before deciding to forgive it. Rows revoked before this column existed read
     * as null, which is treated as "not a rotation" — the safe default.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "revoked_reason", length = 16)
    private RefreshTokenRevocation revokedReason;

    public RefreshToken(User user, String tokenHash, Instant expiresAt) {
        this.user = user;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
    }

    public boolean isActive(Instant now) {
        return revokedAt == null && now.isBefore(expiresAt);
    }

    /** True only for a token replaced by a routine rotation, which may be forgiven inside the grace window. */
    public boolean wasRotated() {
        return revokedReason == RefreshTokenRevocation.ROTATED;
    }
}
