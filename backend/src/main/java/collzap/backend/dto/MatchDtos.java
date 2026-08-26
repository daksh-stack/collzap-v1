package collzap.backend.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import collzap.backend.enums.ConnectionType;
import collzap.backend.enums.MatchGroupStatus;
import collzap.backend.enums.ProjectType;
import collzap.backend.enums.SeriousnessLevel;

public final class MatchDtos {

    private MatchDtos() {
    }

    /** Outcome of running the matcher for one of the user's interests. */
    public enum MatchOutcome {
        /** Placed in a live group; the chat room is open. */
        MATCHED,
        /** Sitting in the queue. Poll again or wait for the push. */
        QUEUED,
        /** Already in a group for this interest, nothing to do. */
        ALREADY_MATCHED
    }

    public record FindMatchesResponse(List<MatchResultResponse> results) {
    }

    public record MatchResultResponse(
        UUID interestId,
        String interestName,
        ProjectType projectType,
        ConnectionType connectionType,
        MatchOutcome outcome,
        String message,
        MatchGroupResponse group
    ) {
    }

    public record MatchGroupResponse(
        UUID id,
        UUID interestId,
        String interestName,
        ProjectType projectType,
        ConnectionType connectionType,
        MatchGroupStatus status,
        SeriousnessLevel levelBand,
        int memberCount,
        int maxMembers,
        UUID chatRoomId,
        Instant createdAt,
        Instant openedAt,
        long waitingSeconds,
        List<MemberSummary> members
    ) {
    }

    public record MemberSummary(
        UUID userId,
        String name,
        String profilePhotoUrl,
        Integer yearOfStudy,
        SeriousnessLevel level,
        Instant joinedAt,
        boolean self
    ) {
    }

    /** The Circle tab: live connections plus anything still queued. */
    public record CircleResponse(
        List<MatchGroupResponse> connections,
        List<MatchGroupResponse> waiting
    ) {
    }
}
