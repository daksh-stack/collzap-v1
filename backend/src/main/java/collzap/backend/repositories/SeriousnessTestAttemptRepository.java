package collzap.backend.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import collzap.backend.enums.TestAttemptStatus;
import collzap.backend.models.SeriousnessTestAttempt;

public interface SeriousnessTestAttemptRepository extends JpaRepository<SeriousnessTestAttempt, UUID> {

    @Query("""
        select a from SeriousnessTestAttempt a
        join fetch a.interest
        where a.user.id = :userId and a.status = collzap.backend.enums.TestAttemptStatus.IN_PROGRESS
        """)
    List<SeriousnessTestAttempt> findActiveAttemptsByUserId(@Param("userId") UUID userId);

    /**
     * The user's current standing per interest: the newest submitted attempt.
     * Drives both the score screen tags and the level used for matching.
     */
    @Query("""
        select a from SeriousnessTestAttempt a
        join fetch a.interest
        where a.user.id = :userId
          and a.status = collzap.backend.enums.TestAttemptStatus.SUBMITTED
        order by a.submittedAt desc
        """)
    List<SeriousnessTestAttempt> findSubmittedByUserIdNewestFirst(@Param("userId") UUID userId);

    Optional<SeriousnessTestAttempt> findFirstByUserIdAndInterestIdAndStatusOrderBySubmittedAtDesc(
        UUID userId,
        UUID interestId,
        TestAttemptStatus status
    );

    void deleteByUserId(UUID userId);
}
