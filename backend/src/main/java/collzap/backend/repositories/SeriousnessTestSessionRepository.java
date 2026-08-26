package collzap.backend.repositories;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import collzap.backend.enums.TestAttemptStatus;
import collzap.backend.models.SeriousnessTestSession;

public interface SeriousnessTestSessionRepository extends JpaRepository<SeriousnessTestSession, UUID> {

    Optional<SeriousnessTestSession> findFirstByUserIdAndStatusOrderByCreatedAtDesc(
        UUID userId,
        TestAttemptStatus status
    );

    List<SeriousnessTestSession> findByUserIdAndStatus(UUID userId, TestAttemptStatus status);

    /** Feeds the sweeper that closes sittings whose silent timer ran out. */
    @Query("""
        select s from SeriousnessTestSession s
        where s.status = collzap.backend.enums.TestAttemptStatus.IN_PROGRESS
          and s.expiresAt < :now
        """)
    List<SeriousnessTestSession> findExpiredInProgress(@Param("now") Instant now);

    void deleteByUserId(UUID userId);
}
