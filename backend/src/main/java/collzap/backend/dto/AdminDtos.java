package collzap.backend.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import collzap.backend.enums.ConnectionType;
import collzap.backend.enums.DocumentType;
import collzap.backend.enums.MatchGroupStatus;
import collzap.backend.enums.ProjectType;
import collzap.backend.enums.SeriousnessLevel;
import collzap.backend.enums.Status;
import collzap.backend.enums.VerificationStatus;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class AdminDtos {

    private AdminDtos() {
    }

    public record AdminStatsResponse(
        long totalUsers,
        long verifiedUsers,
        long pendingVerifications,
        long activeMatchGroups,
        long waitingMatchGroups,
        long totalMessages
    ) {
    }

    public record AdminUserRow(
        UUID id,
        String name,
        String email,
        String collegeName,
        VerificationStatus verificationStatus,
        Status accountStatus,
        boolean profileCompleted,
        Instant createdAt
    ) {
    }

    public record PendingVerificationRow(
        UUID documentId,
        UUID userId,
        String userName,
        String email,
        String collegeName,
        DocumentType documentType,
        String documentUrl,
        Instant uploadedAt
    ) {
    }

    public record AdminMatchRow(
        UUID matchGroupId,
        String interestName,
        String collegeName,
        ProjectType projectType,
        ConnectionType connectionType,
        MatchGroupStatus status,
        SeriousnessLevel levelBand,
        int memberCount,
        int maxMembers,
        List<String> memberNames,
        Instant createdAt,
        Instant openedAt
    ) {
    }

    /** Waiting queue view, with how long the group has been sitting there. */
    public record AdminQueueRow(
        UUID matchGroupId,
        String interestName,
        String collegeName,
        ProjectType projectType,
        ConnectionType connectionType,
        SeriousnessLevel levelBand,
        Instant waitingSince,
        long waitedSeconds,
        List<String> memberNames
    ) {
    }

    public record CreateMatchRequest(
        @NotEmpty(message = "Pick at least two users to match")
        @Size(min = 2, max = 4, message = "A manual match takes 2 to 4 users")
        List<UUID> userIds,

        @NotNull(message = "Interest is required")
        UUID interestId,

        @NotNull(message = "Connection type is required")
        ConnectionType connectionType,

        @NotNull(message = "Project type is required")
        ProjectType projectType
    ) {
    }

    public record UnmatchRequest(
        @NotNull(message = "Match group is required")
        UUID matchGroupId,

        /** Remove a single member; omit to dissolve the whole group. */
        UUID userId
    ) {
    }

    public record AdminReportRow(
        UUID id,
        UUID reporterId,
        String reporterName,
        UUID reportedId,
        String reportedName,
        String reason,
        Instant createdAt
    ) {
    }

    public record InterestFeedbackRow(
        UUID id,
        UUID userId,
        String userName,
        ProjectType projectType,
        String suggestion,
        Instant createdAt
    ) {
    }
}
