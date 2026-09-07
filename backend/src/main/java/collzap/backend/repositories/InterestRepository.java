package collzap.backend.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import collzap.backend.enums.InterestCategory;
import collzap.backend.models.Interest;

public interface InterestRepository extends JpaRepository<Interest, UUID> {

    List<Interest> findByCategoryAndActiveTrueOrderByDisplayOrderAsc(InterestCategory category);

    List<Interest> findByActiveTrueOrderByCategoryAscDisplayOrderAsc();

    boolean existsByNameIgnoreCaseAndCategory(String name, InterestCategory category);

    Optional<Interest> findFirstByCategoryOrderByDisplayOrderDesc(InterestCategory category);
}
