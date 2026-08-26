package collzap.backend.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import collzap.backend.models.College;

public interface CollegeRepository extends JpaRepository<College, UUID> {

    Optional<College> findByEmailDomainIgnoreCase(String emailDomain);

    Optional<College> findByNameIgnoreCase(String name);

    boolean existsByEmailDomainIgnoreCase(String emailDomain);
}
