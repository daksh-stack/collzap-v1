package collzap.backend.repositories;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import collzap.backend.enums.MatchGroupStatus;
import collzap.backend.models.GroupTaskProgress;

public interface GroupTaskProgressRepository extends JpaRepository<GroupTaskProgress, UUID> {

    Optional<GroupTaskProgress> findByMatchGroupId(UUID matchGroupId);

    /** Existing progress rows the daily rollover still needs to tick today. */
    @Query("""
        select p from GroupTaskProgress p
        join fetch p.matchGroup g
        join fetch p.taskBank
        where g.status = :status
          and p.completedAt is null
          and (p.lastAssignedDate is null or p.lastAssignedDate <> :today)
        """)
    List<GroupTaskProgress> findTickableForStatus(
        @Param("status") MatchGroupStatus status,
        @Param("today") LocalDate today
    );
}
