package collzap.backend.repositories;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import collzap.backend.enums.OtpPurpose;
import collzap.backend.models.OtpCode;

public interface OtpCodeRepository extends JpaRepository<OtpCode, UUID> {

    /** Newest first, so the latest code issued for an address wins. */
    List<OtpCode> findByEmailIgnoreCaseAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(
        String email,
        OtpPurpose purpose
    );

    long countByEmailIgnoreCaseAndCreatedAtAfter(String email, Instant since);

    @Modifying
    @Query("update OtpCode o set o.consumedAt = :now where o.email = lower(:email) and o.consumedAt is null")
    void consumeAllForEmail(@Param("email") String email, @Param("now") Instant now);

    @Modifying
    @Query("delete from OtpCode o where o.expiresAt < :cutoff")
    int deleteExpired(@Param("cutoff") Instant cutoff);
}
