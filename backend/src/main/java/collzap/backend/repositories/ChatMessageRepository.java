package collzap.backend.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import collzap.backend.models.ChatMessage;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    /** Newest first for paging; the controller reverses for display. */
    @Query("""
        select m from ChatMessage m
        join fetch m.sender
        where m.chatRoom.id = :roomId
        order by m.sentAt desc
        """)
    Page<ChatMessage> findPageByRoomId(@Param("roomId") UUID roomId, Pageable pageable);

    /** Latest message per room, for the chat-list previews. */
    @Query("""
        select m from ChatMessage m
        join fetch m.sender
        where m.chatRoom.id in :roomIds
          and m.sentAt = (
              select max(m2.sentAt) from ChatMessage m2 where m2.chatRoom.id = m.chatRoom.id
          )
        """)
    List<ChatMessage> findLatestPerRoom(@Param("roomIds") List<UUID> roomIds);

    long countByChatRoomId(UUID chatRoomId);

    List<ChatMessage> findBySenderId(UUID senderId);

    void deleteBySenderId(UUID senderId);
}
