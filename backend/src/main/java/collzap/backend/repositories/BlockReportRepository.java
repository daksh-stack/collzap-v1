package collzap.backend.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import collzap.backend.enums.ModerationAction;
import collzap.backend.models.BlockReport;

public interface BlockReportRepository extends JpaRepository<BlockReport, UUID> {

    boolean existsByReporterIdAndReportedIdAndActionType(
        UUID reporterId,
        UUID reportedId,
        ModerationAction actionType
    );

    @Query("""
        select b from BlockReport b
        join fetch b.reported
        where b.reporter.id = :userId and b.actionType = collzap.backend.enums.ModerationAction.BLOCK
        """)
    List<BlockReport> findBlocksByReporterId(@Param("userId") UUID userId);

    /**
     * Everyone the user must not be matched with: people they blocked plus
     * people who blocked them.
     */
    @Query("""
        select case when b.reporter.id = :userId then b.reported.id else b.reporter.id end
        from BlockReport b
        where b.actionType = collzap.backend.enums.ModerationAction.BLOCK
          and (b.reporter.id = :userId or b.reported.id = :userId)
        """)
    List<UUID> findBlockedCounterpartIds(@Param("userId") UUID userId);

    void deleteByReporterIdAndReportedIdAndActionType(
        UUID reporterId,
        UUID reportedId,
        ModerationAction actionType
    );

    @Query("""
        select b from BlockReport b
        join fetch b.reporter
        join fetch b.reported
        where b.actionType = :actionType
        order by b.createdAt desc
        """)
    Page<BlockReport> findByActionType(@Param("actionType") ModerationAction actionType, Pageable pageable);

    @Modifying
    @Query("delete from BlockReport b where b.reporter.id = :userId or b.reported.id = :userId")
    void deleteByReporterIdOrReportedId(@Param("userId") UUID userId);
}
