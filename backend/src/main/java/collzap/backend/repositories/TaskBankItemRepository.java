package collzap.backend.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import collzap.backend.models.TaskBankItem;

public interface TaskBankItemRepository extends JpaRepository<TaskBankItem, UUID> {

    Optional<TaskBankItem> findByTaskBankIdAndDayIndex(UUID taskBankId, int dayIndex);

    List<TaskBankItem> findByTaskBankIdOrderByDayIndexAsc(UUID taskBankId);
}
