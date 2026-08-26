package collzap.backend.models;

import java.time.Instant;

import collzap.backend.enums.ReceiptStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Per-recipient delivery state for a message. One row per message per recipient
 * (the sender gets none); the lowest status across rows drives the tick shown.
 */
@Entity
@Table(
    name = "message_receipts",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_message_receipt",
        columnNames = {"message_id", "user_id"}
    ),
    indexes = {
        @Index(name = "idx_message_receipts_message_id", columnList = "message_id"),
        @Index(name = "idx_message_receipts_user_id", columnList = "user_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class MessageReceipt extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "message_id", nullable = false)
    private ChatMessage message;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private ReceiptStatus status = ReceiptStatus.SENT;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public MessageReceipt(ChatMessage message, User user, ReceiptStatus status, Instant updatedAt) {
        this.message = message;
        this.user = user;
        this.status = status;
        this.updatedAt = updatedAt;
    }
}
