package collzap.backend.dto;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import collzap.backend.enums.NotificationType;

public final class NotificationDtos {

    private NotificationDtos() {
    }

    public record NotificationResponse(
        UUID id,
        NotificationType type,
        String title,
        String body,
        Map<String, Object> payload,
        boolean read,
        Instant createdAt
    ) {
    }

    public record UnreadCountResponse(long unreadCount) {
    }
}
