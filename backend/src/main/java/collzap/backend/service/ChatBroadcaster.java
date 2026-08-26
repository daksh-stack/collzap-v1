package collzap.backend.service;

import java.util.UUID;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import collzap.backend.dto.ChatDtos.ChatMessageResponse;
import collzap.backend.dto.ChatDtos.ChatSocketEvent;
import collzap.backend.dto.ChatDtos.ReceiptUpdate;
import collzap.backend.dto.MatchDtos.MemberSummary;

/**
 * Owns the room topic naming so the chat and matching services agree on where
 * events land. Clients subscribe to {@code /topic/rooms/{chatRoomId}}.
 */
@Component
public class ChatBroadcaster {

    private static final String ROOM_TOPIC_PREFIX = "/topic/rooms/";

    private final SimpMessagingTemplate messagingTemplate;

    public ChatBroadcaster(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public static String topicFor(UUID chatRoomId) {
        return ROOM_TOPIC_PREFIX + chatRoomId;
    }

    public void message(UUID chatRoomId, ChatMessageResponse message) {
        messagingTemplate.convertAndSend(topicFor(chatRoomId), ChatSocketEvent.message(chatRoomId, message));
    }

    public void receipts(UUID chatRoomId, ReceiptUpdate update) {
        messagingTemplate.convertAndSend(topicFor(chatRoomId), ChatSocketEvent.receipts(chatRoomId, update));
    }

    public void memberJoined(UUID chatRoomId, MemberSummary member) {
        messagingTemplate.convertAndSend(
            topicFor(chatRoomId), ChatSocketEvent.memberJoined(chatRoomId, member));
    }
}
