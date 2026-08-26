package collzap.backend.service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import collzap.backend.dto.CommonDtos.PageResponse;
import collzap.backend.dto.NotificationDtos.NotificationResponse;
import collzap.backend.dto.NotificationDtos.UnreadCountResponse;
import collzap.backend.enums.NotificationType;
import collzap.backend.exception.NotFoundException;
import collzap.backend.models.Notification;
import collzap.backend.models.User;
import collzap.backend.repositories.DeviceTokenRepository;
import collzap.backend.repositories.NotificationRepository;

/**
 * One place that raises a notification three ways: a stored row for the in-app
 * list, a socket push for a client that is already connected, and a device push
 * for one that is not.
 */
@Service
public class NotificationService {

    /** Clients subscribe to {@code /user/queue/notifications}. */
    private static final String USER_DESTINATION = "/queue/notifications";

    private final NotificationRepository notificationRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final PushDispatcher pushDispatcher;

    public NotificationService(
        NotificationRepository notificationRepository,
        DeviceTokenRepository deviceTokenRepository,
        SimpMessagingTemplate messagingTemplate,
        PushDispatcher pushDispatcher
    ) {
        this.notificationRepository = notificationRepository;
        this.deviceTokenRepository = deviceTokenRepository;
        this.messagingTemplate = messagingTemplate;
        this.pushDispatcher = pushDispatcher;
    }

    @Transactional
    public void notifyUser(
        User user,
        NotificationType type,
        String title,
        String body,
        Map<String, Object> payload
    ) {
        Map<String, Object> data = payload == null ? new HashMap<>() : new HashMap<>(payload);
        Notification notification = notificationRepository.save(
            new Notification(user, type, title, body, data));

        NotificationResponse response = toResponse(notification);
        messagingTemplate.convertAndSendToUser(user.getId().toString(), USER_DESTINATION, response);

        if (user.isNotificationsEnabled()) {
            pushDispatcher.dispatch(deviceTokenRepository.findByUserId(user.getId()), title, body, data);
        }
    }

    @Transactional
    public void notifyAll(
        List<User> users,
        NotificationType type,
        String title,
        String body,
        Map<String, Object> payload
    ) {
        users.forEach(user -> notifyUser(user, type, title, body, payload));
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> list(UUID userId, Pageable pageable) {
        Page<Notification> page = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return PageResponse.from(page, NotificationService::toResponse);
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse unreadCount(UUID userId) {
        return new UnreadCountResponse(notificationRepository.countByUserIdAndReadFalse(userId));
    }

    @Transactional
    public int markAllRead(UUID userId) {
        return notificationRepository.markAllRead(userId, Instant.now());
    }

    @Transactional
    public NotificationResponse markRead(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .filter(n -> n.getUser().getId().equals(userId))
            .orElseThrow(() -> new NotFoundException("Notification not found"));
        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(Instant.now());
            notificationRepository.save(notification);
        }
        return toResponse(notification);
    }

    public static NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
            notification.getId(),
            notification.getType(),
            notification.getTitle(),
            notification.getBody(),
            notification.getPayload(),
            notification.isRead(),
            notification.getCreatedAt()
        );
    }
}
