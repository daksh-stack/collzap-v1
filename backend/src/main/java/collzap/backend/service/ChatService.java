package collzap.backend.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import collzap.backend.dto.ChatDtos.ChatListItemResponse;
import collzap.backend.dto.ChatDtos.ChatMessageResponse;
import collzap.backend.dto.ChatDtos.ChatRoomDetailResponse;
import collzap.backend.dto.ChatDtos.MarkReadResponse;
import collzap.backend.dto.ChatDtos.ReceiptUpdate;
import collzap.backend.dto.ChatDtos.SendMessageRequest;
import collzap.backend.dto.CommonDtos.PageResponse;
import collzap.backend.dto.MatchDtos.MemberSummary;
import collzap.backend.enums.ChatRoomType;
import collzap.backend.enums.MatchGroupStatus;
import collzap.backend.enums.NotificationType;
import collzap.backend.enums.ReceiptStatus;
import collzap.backend.exception.BadRequestException;
import collzap.backend.exception.ForbiddenException;
import collzap.backend.exception.NotFoundException;
import collzap.backend.models.ChatMessage;
import collzap.backend.models.ChatRoom;
import collzap.backend.models.MatchGroup;
import collzap.backend.models.MatchMember;
import collzap.backend.models.MessageReceipt;
import collzap.backend.models.User;
import collzap.backend.repositories.ChatMessageRepository;
import collzap.backend.repositories.ChatRoomRepository;
import collzap.backend.repositories.MatchMemberRepository;
import collzap.backend.repositories.MessageReceiptRepository;

/**
 * The chat system: one-on-one, short group and society rooms all share this code
 * path. A message is persisted first and broadcast second, so a client that
 * reconnects and refetches history sees exactly what the socket delivered.
 *
 * <p>Access is membership-based throughout — only an active member of the room's
 * match group can read it, post to it, or see it in their chat list.
 */
@Service
public class ChatService {

    /** Shown by the client when a freshly-opened room has no messages. */
    private static final String EMPTY_STATE = "You are now connected. Say hello!";

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final MessageReceiptRepository messageReceiptRepository;
    private final MatchMemberRepository matchMemberRepository;
    private final SeriousnessLevelLookup levelLookup;
    private final ChatBroadcaster chatBroadcaster;
    private final NotificationService notificationService;
    private final UserService userService;

    public ChatService(
        ChatRoomRepository chatRoomRepository,
        ChatMessageRepository chatMessageRepository,
        MessageReceiptRepository messageReceiptRepository,
        MatchMemberRepository matchMemberRepository,
        SeriousnessLevelLookup levelLookup,
        ChatBroadcaster chatBroadcaster,
        NotificationService notificationService,
        UserService userService
    ) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.messageReceiptRepository = messageReceiptRepository;
        this.matchMemberRepository = matchMemberRepository;
        this.levelLookup = levelLookup;
        this.chatBroadcaster = chatBroadcaster;
        this.notificationService = notificationService;
        this.userService = userService;
    }

    /** The Chat tab: one row per room, newest conversation first. */
    @Transactional(readOnly = true)
    public List<ChatListItemResponse> list(UUID userId) {
        List<MatchGroup> groups = matchMemberRepository.findActiveWithGroupByUserId(userId).stream()
            .map(MatchMember::getMatchGroup)
            .filter(group -> group.getStatus() == MatchGroupStatus.ACTIVE)
            .toList();
        if (groups.isEmpty()) {
            return List.of();
        }

        List<UUID> groupIds = groups.stream().map(MatchGroup::getId).toList();
        List<ChatRoom> rooms = chatRoomRepository.findWithGroupByMatchGroupIdIn(groupIds);
        if (rooms.isEmpty()) {
            return List.of();
        }
        List<UUID> roomIds = rooms.stream().map(ChatRoom::getId).toList();

        Map<UUID, List<MatchMember>> membersByGroup = new HashMap<>();
        for (MatchMember member : matchMemberRepository.findActiveWithUserByGroupIdIn(groupIds)) {
            membersByGroup
                .computeIfAbsent(member.getMatchGroup().getId(), key -> new ArrayList<>())
                .add(member);
        }
        Map<UUID, ChatMessage> latestByRoom = new HashMap<>();
        for (ChatMessage message : chatMessageRepository.findLatestPerRoom(roomIds)) {
            latestByRoom.put(message.getChatRoom().getId(), message);
        }
        Map<UUID, Long> unreadByRoom = new HashMap<>();
        for (Object[] row : messageReceiptRepository.countUnreadPerRoom(roomIds, userId)) {
            unreadByRoom.put((UUID) row[0], (Long) row[1]);
        }

        List<ChatListItemResponse> items = new ArrayList<>(rooms.size());
        for (ChatRoom room : rooms) {
            MatchGroup group = room.getMatchGroup();
            List<MatchMember> members = membersByGroup.getOrDefault(group.getId(), List.of());
            ChatMessage latest = latestByRoom.get(room.getId());

            items.add(new ChatListItemResponse(
                room.getId(),
                group.getId(),
                room.getType(),
                titleFor(room, members, userId),
                group.getInterest().getName(),
                members.size(),
                latest == null ? null : preview(latest, userId),
                latest == null ? group.getOpenedAt() : latest.getSentAt(),
                unreadByRoom.getOrDefault(room.getId(), 0L),
                summarise(group, members, userId)
            ));
        }

        // Rooms with no messages sort by when they opened, so a brand-new match still
        // surfaces at the top of the list.
        items.sort(Comparator.comparing(
            ChatListItemResponse::lastMessageAt,
            Comparator.nullsLast(Comparator.reverseOrder())
        ));
        return items;
    }

    @Transactional(readOnly = true)
    public ChatRoomDetailResponse room(UUID userId, UUID roomId) {
        ChatRoom room = requireMembership(userId, roomId);
        MatchGroup group = room.getMatchGroup();
        List<MatchMember> members = matchMemberRepository.findActiveWithUserByGroupId(group.getId());
        boolean empty = chatMessageRepository.countByChatRoomId(roomId) == 0;

        return new ChatRoomDetailResponse(
            room.getId(),
            group.getId(),
            room.getType(),
            titleFor(room, members, userId),
            group.getInterest().getName(),
            summarise(group, members, userId),
            empty ? EMPTY_STATE : null
        );
    }

    /**
     * Message history, newest page first. Within a page the messages are ordered
     * oldest to newest so the client can append them straight into the transcript.
     */
    @Transactional(readOnly = true)
    public PageResponse<ChatMessageResponse> history(UUID userId, UUID roomId, Pageable pageable) {
        requireMembership(userId, roomId);
        Page<ChatMessage> page = chatMessageRepository.findPageByRoomId(roomId, pageable);

        List<ChatMessage> chronological = new ArrayList<>(page.getContent());
        chronological.sort(Comparator.comparing(ChatMessage::getSentAt));

        Map<UUID, ReceiptStatus> ticks = ticksFor(chronological);
        List<ChatMessageResponse> content = chronological.stream()
            .map(message -> toResponse(message, userId, ticks.get(message.getId()), null))
            .toList();

        return new PageResponse<>(
            content,
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isLast()
        );
    }

    /**
     * Persists a message, opens a SENT receipt for every other member, then pushes it
     * to the room topic and raises a notification for anyone not watching.
     */
    @Transactional
    public ChatMessageResponse send(UUID userId, UUID roomId, SendMessageRequest request) {
        ChatRoom room = requireMembership(userId, roomId);
        String content = request.content() == null ? "" : request.content().trim();
        if (content.isEmpty()) {
            throw new BadRequestException("Message cannot be empty");
        }

        User sender = userService.require(userId);
        Instant now = Instant.now();
        ChatMessage message = chatMessageRepository.save(new ChatMessage(room, sender, content, now));

        List<MatchMember> members =
            matchMemberRepository.findActiveWithUserByGroupId(room.getMatchGroup().getId());
        List<User> recipients = members.stream()
            .map(MatchMember::getUser)
            .filter(member -> !member.getId().equals(userId))
            .toList();
        for (User recipient : recipients) {
            messageReceiptRepository.save(
                new MessageReceipt(message, recipient, ReceiptStatus.SENT, now));
        }

        ChatMessageResponse response = toResponse(
            message,
            userId,
            recipients.isEmpty() ? null : ReceiptStatus.SENT,
            request.clientMessageId()
        );
        // The topic payload is viewer-neutral: one broadcast reaches every subscriber,
        // so "mine" and the tick would be wrong for everyone but the sender. Clients
        // derive ownership from senderId; the sender gets their own tick from the
        // response to this call.
        chatBroadcaster.message(roomId, toResponse(message, null, null, request.clientMessageId()));
        notifyRecipients(room, sender, recipients, content);
        return response;
    }

    /**
     * Marks everything the user can see in a room as read and tells the room so
     * senders can flip their ticks blue.
     */
    @Transactional
    public MarkReadResponse markRead(UUID userId, UUID roomId) {
        return advance(userId, roomId, ReceiptStatus.READ);
    }

    /** Called when a client is connected but not looking at the room. */
    @Transactional
    public MarkReadResponse markDelivered(UUID userId, UUID roomId) {
        return advance(userId, roomId, ReceiptStatus.DELIVERED);
    }

    private MarkReadResponse advance(UUID userId, UUID roomId, ReceiptStatus target) {
        requireMembership(userId, roomId);
        // Only the statuses ranking below the target may move, so a room re-entered
        // after reading does not knock its receipts back to DELIVERED.
        List<ReceiptStatus> from = statusesBelow(target);
        if (from.isEmpty()) {
            return new MarkReadResponse(roomId, 0);
        }

        Instant now = Instant.now();
        int updated = messageReceiptRepository.advanceStatusInRoom(roomId, userId, target, from, now, now);
        if (updated > 0) {
            chatBroadcaster.receipts(roomId, new ReceiptUpdate(userId, target, now));
        }
        return new MarkReadResponse(roomId, updated);
    }

    /**
     * The sender's tick is the least-advanced recipient status: one grey tick while
     * anyone is still on SENT, two once everyone has it, blue once everyone has read
     * it. Reduced here rather than in SQL because the column stores enum names, which
     * sort alphabetically instead of by progression.
     */
    private Map<UUID, ReceiptStatus> ticksFor(List<ChatMessage> messages) {
        if (messages.isEmpty()) {
            return Map.of();
        }
        List<UUID> ids = messages.stream().map(ChatMessage::getId).toList();
        Map<UUID, ReceiptStatus> lowest = new HashMap<>();
        for (Object[] row : messageReceiptRepository.findStatusesForMessages(ids)) {
            UUID messageId = (UUID) row[0];
            ReceiptStatus status = (ReceiptStatus) row[1];
            lowest.merge(messageId, status, ChatService::lower);
        }
        return lowest;
    }

    private void notifyRecipients(ChatRoom room, User sender, List<User> recipients, String content) {
        if (recipients.isEmpty()) {
            return;
        }
        notificationService.notifyAll(
            recipients,
            NotificationType.NEW_MESSAGE,
            sender.getName(),
            content.length() > 120 ? content.substring(0, 120) + "…" : content,
            Map.of(
                "chatRoomId", room.getId().toString(),
                "matchGroupId", room.getMatchGroup().getId().toString(),
                "senderId", sender.getId().toString()
            )
        );
    }

    /** Loads the room and refuses anyone who is not an active member of its group. */
    private ChatRoom requireMembership(UUID userId, UUID roomId) {
        ChatRoom room = chatRoomRepository.findWithGroupById(roomId)
            .orElseThrow(() -> new NotFoundException("Chat not found"));
        boolean member = matchMemberRepository.existsByMatchGroupIdAndUserIdAndActiveTrue(
            room.getMatchGroup().getId(), userId);
        if (!member) {
            throw new ForbiddenException("You do not have access to this chat");
        }
        return room;
    }

    private List<MemberSummary> summarise(MatchGroup group, List<MatchMember> members, UUID viewerId) {
        UUID interestId = group.getInterest().getId();
        return members.stream()
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
    }

    /** One-on-one rooms are titled after the other person; the rest after the interest. */
    private static String titleFor(ChatRoom room, List<MatchMember> members, UUID viewerId) {
        String interestName = room.getMatchGroup().getInterest().getName();
        if (room.getType() == ChatRoomType.ONE_ON_ONE) {
            return members.stream()
                .map(MatchMember::getUser)
                .filter(user -> !user.getId().equals(viewerId))
                .map(User::getName)
                .findFirst()
                .orElse(interestName);
        }
        return room.getType() == ChatRoomType.SOCIETY
            ? interestName + " Society"
            : interestName + " Group";
    }

    private static String preview(ChatMessage message, UUID viewerId) {
        String body = message.getContent().length() > 80
            ? message.getContent().substring(0, 80) + "…"
            : message.getContent();
        return message.getSender().getId().equals(viewerId) ? "You: " + body : body;
    }

    private static ChatMessageResponse toResponse(
        ChatMessage message,
        UUID viewerId,
        ReceiptStatus tick,
        String clientMessageId
    ) {
        User sender = message.getSender();
        boolean mine = sender.getId().equals(viewerId);
        return new ChatMessageResponse(
            message.getId(),
            message.getChatRoom().getId(),
            sender.getId(),
            sender.getName(),
            sender.getProfilePhotoUrl(),
            message.getContent(),
            message.getSentAt(),
            // Only the sender needs a tick; a received message has no receipt of its own.
            mine ? tick : null,
            mine,
            clientMessageId
        );
    }

    private static ReceiptStatus lower(ReceiptStatus a, ReceiptStatus b) {
        return a.rank() <= b.rank() ? a : b;
    }

    private static List<ReceiptStatus> statusesBelow(ReceiptStatus target) {
        return Arrays.stream(ReceiptStatus.values())
            .filter(status -> status.rank() < target.rank())
            .toList();
    }
}
