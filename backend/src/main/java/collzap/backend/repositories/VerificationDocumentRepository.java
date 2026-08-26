package collzap.backend.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import collzap.backend.enums.DocumentStatus;
import collzap.backend.models.VerificationDocument;

public interface VerificationDocumentRepository extends JpaRepository<VerificationDocument, UUID> {

    List<VerificationDocument> findByUserIdOrderByCreatedAtDesc(UUID userId);

    @Query("""
        select d from VerificationDocument d
        join fetch d.user u
        join fetch u.college
        where d.status = :status
        order by d.createdAt asc
        """)
    Page<VerificationDocument> findQueueByStatus(@Param("status") DocumentStatus status, Pageable pageable);

    @Query("""
        select d from VerificationDocument d
        join fetch d.user u
        join fetch u.college
        where d.id = :id
        """)
    Optional<VerificationDocument> findWithUserById(@Param("id") UUID id);

    long countByStatus(DocumentStatus status);
}
