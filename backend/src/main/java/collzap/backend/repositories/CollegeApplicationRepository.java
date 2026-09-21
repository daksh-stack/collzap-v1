package collzap.backend.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import collzap.backend.enums.DocumentStatus;
import collzap.backend.models.CollegeApplication;

public interface CollegeApplicationRepository extends JpaRepository<CollegeApplication, UUID> {

    boolean existsByEmailIgnoreCaseAndStatus(String email, DocumentStatus status);

    @Query("select a from CollegeApplication a where :status is null or a.status = :status order by a.createdAt asc")
    Page<CollegeApplication> findAllByOptionalStatus(@Param("status") DocumentStatus status, Pageable pageable);

    @Query("select a from CollegeApplication a left join fetch a.reviewedBy where a.id = :id")
    Optional<CollegeApplication> findWithReviewerById(@Param("id") UUID id);
}
