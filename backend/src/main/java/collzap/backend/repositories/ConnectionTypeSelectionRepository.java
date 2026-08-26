package collzap.backend.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import collzap.backend.enums.ProjectType;
import collzap.backend.models.ConnectionTypeSelection;

public interface ConnectionTypeSelectionRepository extends JpaRepository<ConnectionTypeSelection, UUID> {

    Optional<ConnectionTypeSelection> findByUserIdAndProjectType(UUID userId, ProjectType projectType);

    List<ConnectionTypeSelection> findByUserId(UUID userId);

    void deleteByUserId(UUID userId);
}
