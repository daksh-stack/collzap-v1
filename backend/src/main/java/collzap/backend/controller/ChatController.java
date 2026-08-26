package collzap.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import collzap.backend.dto.ChatDtos.ChatListItemResponse;
import collzap.backend.dto.ChatDtos.ChatMessageResponse;
import collzap.backend.dto.ChatDtos.ChatRoomDetailResponse;
import collzap.backend.dto.ChatDtos.MarkReadResponse;
import collzap.backend.dto.ChatDtos.SendMessageRequest;
import collzap.backend.dto.CommonDtos.PageResponse;
import collzap.backend.security.AuthPrincipal;
import collzap.backend.service.ChatService;
import jakarta.validation.Valid;

/**
 * Chat over REST. Sending here persists the message and broadcasts it to
 * {@code /topic/rooms/{roomId}} in the same call, so a client that cannot hold a
 * socket open still works and one that can gets the live copy.
 *
 * <p>Only an active member of a room's match group can touch any of this.
 */
@RestController
@RequestMapping("/api/chats")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /** The Chat tab: title, last message preview, time and unread count per room. */
    @GetMapping
    public List<ChatListItemResponse> list(@AuthenticationPrincipal AuthPrincipal me) {
        return chatService.list(me.userId());
    }

    /** Room header and members. Carries the empty-state line when there are no messages. */
    @GetMapping("/{roomId}")
    public ChatRoomDetailResponse room(
        @AuthenticationPrincipal AuthPrincipal me,
        @PathVariable UUID roomId
    ) {
        return chatService.room(me.userId(), roomId);
    }

    /**
     * History, newest page first. Within a page messages run oldest to newest so the
     * client can prepend a page straight into the transcript.
     */
    @GetMapping("/{roomId}/messages")
    public PageResponse<ChatMessageResponse> history(
        @AuthenticationPrincipal AuthPrincipal me,
        @PathVariable UUID roomId,
        @PageableDefault(size = 50) Pageable pageable
    ) {
        return chatService.history(me.userId(), roomId, pageable);
    }

    @PostMapping("/{roomId}/messages")
    public ChatMessageResponse send(
        @AuthenticationPrincipal AuthPrincipal me,
        @PathVariable UUID roomId,
        @Valid @RequestBody SendMessageRequest request
    ) {
        return chatService.send(me.userId(), roomId, request);
    }

    /** Call on opening a room: turns the other side's ticks blue. */
    @PostMapping("/{roomId}/read")
    public MarkReadResponse markRead(
        @AuthenticationPrincipal AuthPrincipal me,
        @PathVariable UUID roomId
    ) {
        return chatService.markRead(me.userId(), roomId);
    }

    /** Call when connected but not looking at the room: second grey tick. */
    @PostMapping("/{roomId}/delivered")
    public MarkReadResponse markDelivered(
        @AuthenticationPrincipal AuthPrincipal me,
        @PathVariable UUID roomId
    ) {
        return chatService.markDelivered(me.userId(), roomId);
    }
}
