package collzap.backend.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import collzap.backend.enums.ChatRoomType;
import collzap.backend.enums.ReceiptStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class ChatDtos {

    private ChatDtos() {
    }

    public record SendMessageRequest(
        @NotBlank(message = "Message cannot be empty")
        @Size(max = 4000, message = "Message must be at most 4000 characters")
        String content,

        /**
         * Echoed back on the broadcast so an optimistic client can reconcile its
         * local placeholder with the persisted message.
         */
        @Size(max = 64)
        String clientMessageId
    ) {
    }

    public record ChatMessageResponse(
        UUID id,
        UUID chatRoomId,
        UUID senderId,
        String senderName,
        String senderPhotoUrl,
        String content,
        Instant sentAt,
        /** Sender's tick: the lowest status across recipients. Null for received messages. */
        ReceiptStatus receiptStatus,
        boolean mine,
        String clientMessageId
    ) {
    }

    public record ChatListItemResponse(
        UUID chatRoomId,
        UUID matchGroupId,
        ChatRoomType type,
        String title,
        String interestName,
        int memberCount,
        String lastMessagePreview,
        Instant lastMessageAt,
        long unreadCount,
        List<MatchDtos.MemberSummary> members
    ) {
    }

    public record ChatRoomDetailResponse(
        UUID chatRoomId,
        UUID matchGroupId,
        ChatRoomType type,
        String title,
        String interestName,
        List<MatchDtos.MemberSummary> members,
        /** Shown when the room has no messages yet. */
        String emptyStateMessage
    ) {
    }

    public record MarkReadResponse(UUID chatRoomId, int updatedCount) {
    }

    /** Envelope for everything pushed over {@code /topic/rooms/{roomId}}. */
    public record ChatSocketEvent(ChatSocketEventType type, UUID chatRoomId, Object payload, Instant at) {

        public static ChatSocketEvent message(UUID roomId, ChatMessageResponse message) {
            return new ChatSocketEvent(ChatSocketEventType.MESSAGE, roomId, message, Instant.now());
        }

        public static ChatSocketEvent receipts(UUID roomId, ReceiptUpdate update) {
            return new ChatSocketEvent(ChatSocketEventType.RECEIPT, roomId, update, Instant.now());
        }

        public static ChatSocketEvent memberJoined(UUID roomId, MatchDtos.MemberSummary member) {
            return new ChatSocketEvent(ChatSocketEventType.MEMBER_JOINED, roomId, member, Instant.now());
        }
    }

    public enum ChatSocketEventType {
        MESSAGE,
        RECEIPT,
        MEMBER_JOINED
    }

    public record ReceiptUpdate(UUID userId, ReceiptStatus status, Instant upTo) {
    }
}
