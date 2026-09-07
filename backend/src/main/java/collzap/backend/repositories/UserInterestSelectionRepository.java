package collzap.backend.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import collzap.backend.enums.ProjectType;
import collzap.backend.models.UserInterestSelection;

public interface UserInterestSelectionRepository extends JpaRepository<UserInterestSelection, UUID> {

    @Query("""
        select s from UserInterestSelection s
        join fetch s.interest
        where s.user.id = :userId
        order by s.interest.displayOrder asc
        """)
    List<UserInterestSelection> findAllWithInterestByUserId(@Param("userId") UUID userId);

    @Query("""
        select s from UserInterestSelection s
        join fetch s.interest
        where s.user.id = :userId and s.projectType = :projectType
        order by s.interest.displayOrder asc
        """)
    List<UserInterestSelection> findAllWithInterestByUserIdAndProjectType(
        @Param("userId") UUID userId,
        @Param("projectType") ProjectType projectType
    );

    void deleteByUserIdAndProjectType(UUID userId, ProjectType projectType);

    void deleteByUserId(UUID userId);

    long countByUserIdAndProjectType(UUID userId, ProjectType projectType);

    long countByInterestId(UUID interestId);
}
