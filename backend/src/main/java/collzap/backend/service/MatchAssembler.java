package collzap.backend.service;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import collzap.backend.dto.MatchDtos.MatchGroupResponse;
import collzap.backend.dto.MatchDtos.MemberSummary;
import collzap.backend.enums.MatchGroupStatus;
import collzap.backend.models.MatchGroup;
import collzap.backend.models.MatchMember;
import collzap.backend.models.User;
import collzap.backend.repositories.ChatRoomRepository;
import collzap.backend.repositories.MatchMemberRepository;

/** Turns match groups into the shape the Circle tab and chat list expect. */
@Component
public class MatchAssembler {

    private final MatchMemberRepository matchMemberRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final SeriousnessLevelLookup levelLookup;

    public MatchAssembler(
        MatchMemberRepository matchMemberRepository,
        ChatRoomRepository chatRoomRepository,
        SeriousnessLevelLookup levelLookup
    ) {
        this.matchMemberRepository = matchMemberRepository;
        this.chatRoomRepository = chatRoomRepository;
        this.levelLookup = levelLookup;
    }

    @Transactional(readOnly = true)
    public MatchGroupResponse describe(MatchGroup group, UUID viewerId) {
        List<MatchMember> members = matchMemberRepository.findActiveWithUserByGroupId(group.getId());
        UUID chatRoomId = chatRoomRepository.findByMatchGroupId(group.getId())
            .map(room -> room.getId())
            .orElse(null);
        return build(group, members, chatRoomId, viewerId);
    }

    /** Batched variant: one query per collection instead of one per group. */
    @Transactional(readOnly = true)
    public List<MatchGroupResponse> describeAll(List<MatchGroup> groups, UUID viewerId) {
        if (groups.isEmpty()) {
            return List.of();
        }
        List<UUID> groupIds = groups.stream().map(MatchGroup::getId).toList();

        Map<UUID, List<MatchMember>> membersByGroup = new HashMap<>();
        for (MatchMember member : matchMemberRepository.findActiveWithUserByGroupIdIn(groupIds)) {
            membersByGroup
                .computeIfAbsent(member.getMatchGroup().getId(), key -> new java.util.ArrayList<>())
                .add(member);
        }
        Map<UUID, UUID> roomByGroup = new HashMap<>();
        chatRoomRepository.findWithGroupByMatchGroupIdIn(groupIds)
            .forEach(room -> roomByGroup.put(room.getMatchGroup().getId(), room.getId()));

        return groups.stream()
            .map(group -> build(
                group,
                membersByGroup.getOrDefault(group.getId(), List.of()),
                roomByGroup.get(group.getId()),
                viewerId
            ))
            .toList();
    }

    @Transactional(readOnly = true)
    public MemberSummary describeMember(MatchGroup group, User user, Instant joinedAt, UUID viewerId) {
        return new MemberSummary(
            user.getId(),
            user.getName(),
            user.getProfilePhotoUrl(),
            user.getYearOfStudy(),
            levelLookup.levelFor(user.getId(), group.getInterest().getId()).orElse(null),
            joinedAt,
            user.getId().equals(viewerId)
        );
    }

    private MatchGroupResponse build(
        MatchGroup group,
        List<MatchMember> members,
        UUID chatRoomId,
        UUID viewerId
    ) {
        UUID interestId = group.getInterest().getId();
        List<MemberSummary> summaries = members.stream()
            .map(member -> {
                User user = member.getUser();
                return new MemberSummary(
                    user.getId(),
                    user.getName(),
                    user.getProfilePhotoUrl(),
                    user.getYearOfStudy(),
                    levelLookup.levelFor(user.getId(), interestId).orElse(null),
                    member.getJoinedAt(),
                    user.getId().equals(viewerId)
                );
            })
            .toList();

        return new MatchGroupResponse(
            group.getId(),
            interestId,
            group.getInterest().getName(),
            group.getProjectType(),
            group.getConnectionType(),
            group.getStatus(),
            group.getLevelBand(),
            group.getMemberCount(),
            group.getMaxMembers(),
            chatRoomId,
            group.getCreatedAt(),
            group.getOpenedAt(),
            waitedSeconds(group),
            summaries
        );
    }

    /** How long a queued group has been sitting there; zero once it has opened. */
    public static long waitedSeconds(MatchGroup group) {
        if (group.getStatus() != MatchGroupStatus.WAITING || group.getCreatedAt() == null) {
            return 0L;
        }
        return Math.max(0L, Duration.between(group.getCreatedAt(), Instant.now()).toSeconds());
    }
}
