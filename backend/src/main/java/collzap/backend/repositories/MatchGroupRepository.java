package collzap.backend.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import collzap.backend.enums.ConnectionType;
import collzap.backend.enums.MatchGroupStatus;
import collzap.backend.models.MatchGroup;
import jakarta.persistence.LockModeType;

public interface MatchGroupRepository extends JpaRepository<MatchGroup, UUID> {

    /**
     * Candidate buckets for a joining user: same college, same interest, same
     * connection type, still has room, and the user is not already in it.
     * Oldest first so the longest-waiting queue drains before a new one starts.
     * Level tolerance is applied by the caller so it can use enum rank maths.
     */
    @Query("""
        select g from MatchGroup g
        join fetch g.interest
        join fetch g.college
        where g.college.id = :collegeId
          and g.interest.id = :interestId
          and g.connectionType = :connectionType
          and g.status <> collzap.backend.enums.MatchGroupStatus.CLOSED
          and g.memberCount < g.maxMembers
          and not exists (
              select 1 from MatchMember m
              where m.matchGroup = g and m.user.id = :userId and m.active = true
          )
        order by g.createdAt asc
        """)
    List<MatchGroup> findJoinableCandidates(
        @Param("collegeId") UUID collegeId,
        @Param("interestId") UUID interestId,
        @Param("connectionType") ConnectionType connectionType,
        @Param("userId") UUID userId
    );

    /** Re-read under a row lock before mutating membership, to avoid overfilling. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select g from MatchGroup g where g.id = :id")
    Optional<MatchGroup> findByIdForUpdate(@Param("id") UUID id);

    /** A society is a single shared room per college + interest. */
    Optional<MatchGroup> findFirstByCollegeIdAndInterestIdAndConnectionTypeAndStatusNot(
        UUID collegeId,
        UUID interestId,
        ConnectionType connectionType,
        MatchGroupStatus excludedStatus
    );

    @Query("""
        select g from MatchGroup g
        join fetch g.interest
        join fetch g.college
        where g.status = :status
        order by g.createdAt asc
        """)
    List<MatchGroup> findByStatusOldestFirst(@Param("status") MatchGroupStatus status);

    long countByStatus(MatchGroupStatus status);

    long countByInterestId(UUID interestId);

    /** Admin matches table, newest first. */
    @Query(
        value = """
            select g from MatchGroup g
            join fetch g.interest
            join fetch g.college
            order by g.createdAt desc
            """,
        countQuery = "select count(g) from MatchGroup g"
    )
    Page<MatchGroup> findAdminPage(Pageable pageable);

    @Query(
        value = """
            select g from MatchGroup g
            join fetch g.interest
            join fetch g.college
            where g.status = :status
            order by g.createdAt desc
            """,
        countQuery = "select count(g) from MatchGroup g where g.status = :status"
    )
    Page<MatchGroup> findAdminPageByStatus(
        @Param("status") MatchGroupStatus status,
        Pageable pageable
    );
}
