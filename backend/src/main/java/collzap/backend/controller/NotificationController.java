package collzap.backend.controller;

import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import collzap.backend.dto.CommonDtos.MessageResponse;
import collzap.backend.dto.CommonDtos.PageResponse;
import collzap.backend.dto.NotificationDtos.NotificationResponse;
import collzap.backend.dto.NotificationDtos.UnreadCountResponse;
import collzap.backend.security.AuthPrincipal;
import collzap.backend.service.NotificationService;

/**
 * In-app notification history. Match and message alerts are pushed to devices as
 * they happen; this is the stored copy, so a user who missed the push still sees
 * what happened.
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public PageResponse<NotificationResponse> list(
        @AuthenticationPrincipal AuthPrincipal me,
        @PageableDefault(size = 30) Pageable pageable
    ) {
        return notificationService.list(me.userId(), pageable);
    }

    /** Drives the badge on the bell. */
    @GetMapping("/unread-count")
    public UnreadCountResponse unreadCount(@AuthenticationPrincipal AuthPrincipal me) {
        return notificationService.unreadCount(me.userId());
    }

    @PostMapping("/read-all")
    public MessageResponse markAllRead(@AuthenticationPrincipal AuthPrincipal me) {
        int updated = notificationService.markAllRead(me.userId());
        return MessageResponse.of("Marked %d notification(s) as read".formatted(updated));
    }

    @PostMapping("/{notificationId}/read")
    public NotificationResponse markRead(
        @AuthenticationPrincipal AuthPrincipal me,
        @PathVariable UUID notificationId
    ) {
        return notificationService.markRead(me.userId(), notificationId);
    }
}
