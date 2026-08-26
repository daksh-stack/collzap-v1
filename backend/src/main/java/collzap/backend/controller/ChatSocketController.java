package collzap.backend.controller;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;

import collzap.backend.dto.ChatDtos.SendMessageRequest;
import collzap.backend.exception.ApiException;
import collzap.backend.security.AuthPrincipal;
import collzap.backend.security.StompAuthChannelInterceptor;
import collzap.backend.service.ChatService;
import jakarta.validation.Valid;

/**
 * The socket half of chat. Clients publish to {@code /app/rooms/{roomId}/send},
 * {@code /read} and {@code /delivered}; the results land on
 * {@code /topic/rooms/{roomId}} through the same service the REST controller uses,
 * so the two paths cannot drift apart.
 *
 * <p>Nothing is returned to the caller directly — the broadcast is the answer, and
 * the sender is subscribed to it too. Errors go back on the caller's private
 * {@code /user/queue/errors} rather than silently vanishing.
 */
@Controller
public class ChatSocketController {

    private static final Logger log = LoggerFactory.getLogger(ChatSocketController.class);

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatSocketController(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/rooms/{roomId}/send")
    public void send(
        @DestinationVariable UUID roomId,
        @Valid @Payload SendMessageRequest request,
        StompHeaderAccessor accessor
    ) {
        AuthPrincipal me = StompAuthChannelInterceptor.principalOf(accessor);
        chatService.send(me.userId(), roomId, request);
    }

    @MessageMapping("/rooms/{roomId}/read")
    public void markRead(@DestinationVariable UUID roomId, StompHeaderAccessor accessor) {
        AuthPrincipal me = StompAuthChannelInterceptor.principalOf(accessor);
        chatService.markRead(me.userId(), roomId);
    }

    @MessageMapping("/rooms/{roomId}/delivered")
    public void markDelivered(@DestinationVariable UUID roomId, StompHeaderAccessor accessor) {
        AuthPrincipal me = StompAuthChannelInterceptor.principalOf(accessor);
        chatService.markDelivered(me.userId(), roomId);
    }

    /**
     * A frame that fails has no HTTP status to carry the reason, so the message is
     * mirrored to the sender's own queue. The client should surface it the same way
     * it surfaces a failed REST send.
     */
    @MessageExceptionHandler
    public void handleFailure(Throwable error, StompHeaderAccessor accessor) {
        String reason = error instanceof ApiException apiException
            ? apiException.getMessage()
            : "Could not deliver that message";
        if (!(error instanceof ApiException)) {
            log.error("WebSocket frame failed", error);
        }
        if (accessor.getUser() == null) {
            return;
        }
        messagingTemplate.convertAndSendToUser(
            accessor.getUser().getName(),
            "/queue/errors",
            new SocketError(reason)
        );
    }

    private record SocketError(String message) {
    }
}
