package collzap.backend.repositories;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import collzap.backend.enums.RefreshTokenRevocation;
import collzap.backend.models.RefreshToken;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    @Query("select t from RefreshToken t join fetch t.user u left join fetch u.college where t.tokenHash = :tokenHash")
    Optional<RefreshToken> findByTokenHash(@Param("tokenHash") String tokenHash);

    /**
     * Signing out: retires the tokens that are still live and leaves already-revoked
     * history alone, so the reason on an older row still records why it died.
     */
    @Modifying
    @Query("""
        update RefreshToken t
           set t.revokedAt = :now, t.revokedReason = :reason
         where t.user.id = :userId and t.revokedAt is null
        """)
    int revokeAllForUser(
        @Param("userId") UUID userId,
        @Param("now") Instant now,
        @Param("reason") RefreshTokenRevocation reason
    );

    /**
     * Reuse detected: burns every token this user has, including ones already rotated
     * out. Rewriting the reason on those older rows is the point — it is what stops the
     * grace window in AuthService.refresh from forgiving the thief's next attempt.
     * coalesce keeps each row's original revocation time rather than backdating it.
     */
    @Modifying
    @Query("""
        update RefreshToken t
           set t.revokedAt = coalesce(t.revokedAt, :now),
               t.revokedReason = collzap.backend.enums.RefreshTokenRevocation.COMPROMISED
         where t.user.id = :userId
        """)
    int compromiseAllForUser(@Param("userId") UUID userId, @Param("now") Instant now);

    void deleteByUserId(UUID userId);
}
