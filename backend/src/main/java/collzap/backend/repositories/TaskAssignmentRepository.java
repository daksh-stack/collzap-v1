package collzap.backend.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import collzap.backend.models.TaskAssignment;

public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, UUID> {

    /**
     * A derived "first ... order by ... desc" query, the same idiom already used
     * elsewhere in this codebase (see InterestRepository), rather than a hand-written
     * JPQL LIMIT clause — that's newer HQL syntax this project has no other usage of
     * to confirm against, where this pattern is already relied on and known to work.
     */
    @EntityGraph(attributePaths = "taskBankItem")
    Optional<TaskAssignment> findFirstByMatchGroupIdOrderByDayIndexDesc(UUID matchGroupId);
}
