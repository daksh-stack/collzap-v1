package collzap.backend.repositories;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import collzap.backend.models.InterestFeedback;

public interface InterestFeedbackRepository extends JpaRepository<InterestFeedback, UUID> {

    Page<InterestFeedback> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
