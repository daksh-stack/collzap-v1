package collzap.backend.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import collzap.backend.models.SeriousnessTestAnswer;

public interface SeriousnessTestAnswerRepository extends JpaRepository<SeriousnessTestAnswer, UUID> {

    Optional<SeriousnessTestAnswer> findByAttemptIdAndQuestionId(UUID attemptId, UUID questionId);

    List<SeriousnessTestAnswer> findByAttemptId(UUID attemptId);

    long countByAttemptIdAndCorrectTrue(UUID attemptId);



    @Modifying
    @Query("delete from SeriousnessTestAnswer a where a.attempt.user.id = :userId")
    void deleteByUserId(@Param("userId") UUID userId);
}
