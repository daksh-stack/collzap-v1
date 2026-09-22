package collzap.backend.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import collzap.backend.models.UserTaskStats;

public interface UserTaskStatsRepository extends JpaRepository<UserTaskStats, UUID> {

    Optional<UserTaskStats> findByUserId(UUID userId);
}
