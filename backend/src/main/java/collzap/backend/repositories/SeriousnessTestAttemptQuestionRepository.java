package collzap.backend.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import collzap.backend.models.SeriousnessTestAttemptQuestion;

public interface SeriousnessTestAttemptQuestionRepository
    extends JpaRepository<SeriousnessTestAttemptQuestion, UUID> {

    @Query("""
        select sq from SeriousnessTestAttemptQuestion sq
        join fetch sq.question q
        join fetch q.interest
        join fetch sq.attempt a
        where a.user.id = :userId and a.status = 'IN_PROGRESS'
        order by sq.orderIndex asc
        """)
    List<SeriousnessTestAttemptQuestion> findPaperByUserId(@Param("userId") UUID userId);

    @Query("""
        select sq from SeriousnessTestAttemptQuestion sq
        join fetch sq.question q
        join fetch sq.attempt a
        where a.user.id = :userId and a.status = 'IN_PROGRESS' and q.id = :questionId
        """)
    Optional<SeriousnessTestAttemptQuestion> findByUserIdAndQuestionIdInProgress(
        @Param("userId") UUID userId,
        @Param("questionId") UUID questionId
    );

    @Modifying
    @Query("delete from SeriousnessTestAttemptQuestion sq where sq.attempt.user.id = :userId")
    void deleteByUserId(@Param("userId") UUID userId);

    @Modifying
    @Query("delete from SeriousnessTestAttemptQuestion sq where sq.question.interest.id = :interestId")
    void deleteByQuestionInterestId(@Param("interestId") UUID interestId);
}
