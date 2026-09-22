package collzap.backend.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import collzap.backend.models.TaskBank;

public interface TaskBankRepository extends JpaRepository<TaskBank, UUID> {

    Optional<TaskBank> findByInterestIdAndActiveTrue(UUID interestId);

    @Query("select b from TaskBank b join fetch b.interest where b.interest.id = :interestId order by b.createdAt desc")
    List<TaskBank> findAllByInterestIdOrderByCreatedAtDesc(@Param("interestId") UUID interestId);

    @Query("select b from TaskBank b join fetch b.interest order by b.createdAt desc")
    List<TaskBank> findAllWithInterest();
}
