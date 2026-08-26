package collzap.backend.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import collzap.backend.enums.ProjectType;
import collzap.backend.models.UserProjectTypeSelection;

public interface UserProjectTypeSelectionRepository extends JpaRepository<UserProjectTypeSelection, UUID> {

    List<UserProjectTypeSelection> findByUserId(UUID userId);

    boolean existsByUserIdAndProjectType(UUID userId, ProjectType projectType);

    void deleteByUserId(UUID userId);
}
