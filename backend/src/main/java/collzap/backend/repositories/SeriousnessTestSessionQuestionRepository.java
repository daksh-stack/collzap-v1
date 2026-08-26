package collzap.backend.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import collzap.backend.models.SeriousnessTestSessionQuestion;

public interface SeriousnessTestSessionQuestionRepository
    extends JpaRepository<SeriousnessTestSessionQuestion, UUID> {

    @Query("""
        select sq from SeriousnessTestSessionQuestion sq
        join fetch sq.question q
        join fetch q.interest
        join fetch sq.attempt
        where sq.session.id = :sessionId
        order by sq.orderIndex asc
        """)
    List<SeriousnessTestSessionQuestion> findPaperBySessionId(@Param("sessionId") UUID sessionId);

    @Query("""
        select sq from SeriousnessTestSessionQuestion sq
        join fetch sq.question
        join fetch sq.attempt
        where sq.session.id = :sessionId and sq.question.id = :questionId
        """)
    Optional<SeriousnessTestSessionQuestion> findBySessionIdAndQuestionId(
        @Param("sessionId") UUID sessionId,
        @Param("questionId") UUID questionId
    );

    @Modifying
    @Query("delete from SeriousnessTestSessionQuestion sq where sq.session.user.id = :userId")
    void deleteByUserId(@Param("userId") UUID userId);
}
