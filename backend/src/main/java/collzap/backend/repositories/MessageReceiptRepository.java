package collzap.backend.repositories;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import collzap.backend.enums.ReceiptStatus;
import collzap.backend.models.MessageReceipt;

public interface MessageReceiptRepository extends JpaRepository<MessageReceipt, UUID> {

    Optional<MessageReceipt> findByMessageIdAndUserId(UUID messageId, UUID userId);

    List<MessageReceipt> findByMessageIdIn(List<UUID> messageIds);

    /**
     * Advances every receipt the user owns in a room to the given status. Only rows
     * currently in {@code from} are touched, which is what keeps the progression
     * forward-only: the caller passes the statuses that rank strictly below the
     * target, so a READ receipt is never dragged back to DELIVERED. Rank cannot be
     * compared in SQL because the column stores enum names.
     */
    @Modifying
    @Query("""
        update MessageReceipt r
        set r.status = :status, r.updatedAt = :now
        where r.user.id = :userId
          and r.message.chatRoom.id = :roomId
          and r.status in :from
          and r.message.sentAt <= :upTo
        """)
    int advanceStatusInRoom(
        @Param("roomId") UUID roomId,
        @Param("userId") UUID userId,
        @Param("status") ReceiptStatus status,
        @Param("from") Collection<ReceiptStatus> from,
        @Param("upTo") Instant upTo,
        @Param("now") Instant now
    );

    @Query("""
        select count(r) from MessageReceipt r
        where r.user.id = :userId
          and r.message.chatRoom.id = :roomId
          and r.status <> collzap.backend.enums.ReceiptStatus.READ
        """)
    long countUnreadInRoom(@Param("roomId") UUID roomId, @Param("userId") UUID userId);

    @Query("""
        select r.message.chatRoom.id, count(r) from MessageReceipt r
        where r.user.id = :userId
          and r.message.chatRoom.id in :roomIds
          and r.status <> collzap.backend.enums.ReceiptStatus.READ
        group by r.message.chatRoom.id
        """)
    List<Object[]> countUnreadPerRoom(@Param("roomIds") List<UUID> roomIds, @Param("userId") UUID userId);

    /**
     * Recipient statuses for a message. The sender's tick is the lowest of these
     * by {@link ReceiptStatus#rank()} — computed in Java rather than with SQL
     * {@code min()}, which would order the stored names alphabetically
     * (DELIVERED before SENT) instead of by progression.
     */
    @Query("select r.status from MessageReceipt r where r.message.id = :messageId")
    List<ReceiptStatus> findStatusesForMessage(@Param("messageId") UUID messageId);

    @Query("select r.message.id, r.status from MessageReceipt r where r.message.id in :messageIds")
    List<Object[]> findStatusesForMessages(@Param("messageIds") List<UUID> messageIds);

    void deleteByUserId(UUID userId);
}
