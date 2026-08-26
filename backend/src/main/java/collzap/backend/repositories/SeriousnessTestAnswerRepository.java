package collzap.backend.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import collzap.backend.models.SeriousnessTestAnswer;

public interface SeriousnessTestAnswerRepository extends JpaRepository<SeriousnessTestAnswer, UUID> {

    Optional<SeriousnessTestAnswer> findByAttemptIdAndQuestionId(UUID attemptId, UUID questionId);

    List<SeriousnessTestAnswer> findByAttemptId(UUID attemptId);

    long countByAttemptIdAndCorrectTrue(UUID attemptId);

    @Query("""
        select a from SeriousnessTestAnswer a
        join fetch a.question
        where a.attempt.session.id = :sessionId
        """)
    List<SeriousnessTestAnswer> findBySessionId(@Param("sessionId") UUID sessionId);

    @Query("select count(a) from SeriousnessTestAnswer a where a.attempt.session.id = :sessionId")
    long countBySessionId(@Param("sessionId") UUID sessionId);
}
