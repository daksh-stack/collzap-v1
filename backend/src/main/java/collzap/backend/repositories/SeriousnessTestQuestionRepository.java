package collzap.backend.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import collzap.backend.models.SeriousnessTestQuestion;

public interface SeriousnessTestQuestionRepository extends JpaRepository<SeriousnessTestQuestion, UUID> {

    /**
     * Pulls the whole active bank for an interest in random order; the service
     * then takes the slice it needs. Keeps the question bank randomized per
     * sitting without an extra shuffle column.
     */
    @Query(value = """
        select * from seriousness_test_questions
        where interest_id = :interestId and active = true
        order by random()
        limit :limit
        """, nativeQuery = true)
    List<SeriousnessTestQuestion> pickRandomForInterest(
        @Param("interestId") UUID interestId,
        @Param("limit") int limit
    );

    long countByInterestIdAndActiveTrue(UUID interestId);

    long countByInterestId(UUID interestId);
}
