package collzap.backend.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import collzap.backend.dto.AdminDtos.AdminMatchRow;
import collzap.backend.dto.AdminDtos.AdminQueueRow;
import collzap.backend.dto.AdminDtos.AdminReportRow;
import collzap.backend.dto.AdminDtos.AdminStatsResponse;
import collzap.backend.dto.AdminDtos.AdminUserRow;
import collzap.backend.dto.AdminDtos.CreateMatchRequest;
import collzap.backend.dto.AdminDtos.InterestFeedbackRow;
import collzap.backend.dto.AdminDtos.PendingVerificationRow;
import collzap.backend.dto.AdminDtos.UnmatchRequest;
import collzap.backend.dto.CollegeDtos.ReviewDocumentRequest;
import collzap.backend.dto.CollegeDtos.VerificationDocumentResponse;
import collzap.backend.dto.CommonDtos.PageResponse;
import collzap.backend.dto.MatchDtos.MatchGroupResponse;
import collzap.backend.dto.UserDtos.UserResponse;
import collzap.backend.enums.DocumentStatus;
import collzap.backend.enums.MatchGroupStatus;
import collzap.backend.enums.Status;
import collzap.backend.enums.VerificationStatus;
import collzap.backend.exception.NotFoundException;
import collzap.backend.models.AdminUser;
import collzap.backend.models.Interest;
import collzap.backend.models.MatchGroup;
import collzap.backend.models.MatchMember;
import collzap.backend.models.User;
import collzap.backend.repositories.AdminUserRepository;
import collzap.backend.repositories.ChatMessageRepository;
import collzap.backend.repositories.InterestFeedbackRepository;
import collzap.backend.repositories.InterestRepository;
import collzap.backend.repositories.MatchGroupRepository;
import collzap.backend.repositories.MatchMemberRepository;
import collzap.backend.repositories.UserRepository;
import collzap.backend.repositories.VerificationDocumentRepository;

/**
 * Everything behind {@code /admin}. This layer reads across the whole database
 * and delegates any state change to the service that owns it, so an operator
 * approving a document or forcing a match goes through exactly the same rules and
 * notifications as the normal flow.
 */
@Service
public class AdminService {

    private final UserRepository userRepository;
    private final VerificationDocumentRepository verificationDocumentRepository;
    private final MatchGroupRepository matchGroupRepository;
    private final MatchMemberRepository matchMemberRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final InterestRepository interestRepository;
    private final InterestFeedbackRepository interestFeedbackRepository;
    private final AdminUserRepository adminUserRepository;
    private final VerificationService verificationService;
    private final MatchingService matchingService;
    private final ModerationService moderationService;

    public AdminService(
        UserRepository userRepository,
        VerificationDocumentRepository verificationDocumentRepository,
        MatchGroupRepository matchGroupRepository,
        MatchMemberRepository matchMemberRepository,
        ChatMessageRepository chatMessageRepository,
        InterestRepository interestRepository,
        InterestFeedbackRepository interestFeedbackRepository,
        AdminUserRepository adminUserRepository,
        VerificationService verificationService,
        MatchingService matchingService,
        ModerationService moderationService
    ) {
        this.userRepository = userRepository;
        this.verificationDocumentRepository = verificationDocumentRepository;
        this.matchGroupRepository = matchGroupRepository;
        this.matchMemberRepository = matchMemberRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.interestRepository = interestRepository;
        this.interestFeedbackRepository = interestFeedbackRepository;
        this.adminUserRepository = adminUserRepository;
        this.verificationService = verificationService;
        this.matchingService = matchingService;
        this.moderationService = moderationService;
    }

    @Transactional(readOnly = true)
    public AdminStatsResponse stats() {
        return new AdminStatsResponse(
            userRepository.count(),
            userRepository.countByVerificationStatus(VerificationStatus.APPROVED),
            verificationDocumentRepository.countByStatus(DocumentStatus.PENDING),
            matchGroupRepository.countByStatus(MatchGroupStatus.ACTIVE),
            matchGroupRepository.countByStatus(MatchGroupStatus.WAITING),
            chatMessageRepository.count()
        );
    }

    /** The all-users table. {@code status} defaults to active accounts. */
    @Transactional(readOnly = true)
    public PageResponse<AdminUserRow> users(String search, Status status, Pageable pageable) {
        String needle = search == null || search.isBlank() ? null : search.trim();
        Status accountStatus = status == null ? Status.ACTIVE : status;
        return PageResponse.from(
            userRepository.searchActive(accountStatus, needle, pageable),
            user -> new AdminUserRow(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCollege() == null ? null : user.getCollege().getName(),
                user.getVerificationStatus(),
                user.getAccountStatus(),
                user.isProfileCompleted(),
                user.getCreatedAt()
            )
        );
    }

    @Transactional(readOnly = true)
    public UserResponse user(UUID userId) {
        User user = userRepository.findWithCollegeById(userId)
            .orElseThrow(() -> new NotFoundException("User not found"));
        return UserService.toResponse(user);
    }

    /** Documents awaiting manual review, oldest first so nobody is left waiting. */
    @Transactional(readOnly = true)
    public PageResponse<PendingVerificationRow> pendingVerifications(Pageable pageable) {
        return PageResponse.from(
            verificationDocumentRepository.findQueueByStatus(DocumentStatus.PENDING, pageable),
            document -> new PendingVerificationRow(
                document.getId(),
                document.getUser().getId(),
                document.getUser().getName(),
                document.getUser().getEmail(),
                document.getUser().getCollege() == null
                    ? null
                    : document.getUser().getCollege().getName(),
                document.getDocumentType(),
                document.getDocumentUrl(),
                document.getCreatedAt()
            )
        );
    }

    /**
     * Approve or reject a document. Delegates so the user's verification status, the
     * outcome email and the notification all happen exactly as they would anywhere
     * else — the only thing this layer adds is resolving which operator acted.
     */
    @Transactional
    public VerificationDocumentResponse review(
        UUID documentId,
        ReviewDocumentRequest request,
        UUID adminId
    ) {
        AdminUser reviewer = adminUserRepository.findById(adminId)
            .orElseThrow(() -> new NotFoundException("Operator account not found"));
        return verificationService.review(documentId, request, reviewer);
    }

    /** The matches table, with member names resolved in one extra query. */
    @Transactional(readOnly = true)
    public PageResponse<AdminMatchRow> matches(MatchGroupStatus status, Pageable pageable) {
        Page<MatchGroup> page = status == null
            ? matchGroupRepository.findAdminPage(pageable)
            : matchGroupRepository.findAdminPageByStatus(status, pageable);

        Map<UUID, List<String>> names = memberNames(page.getContent());
        return PageResponse.from(page, group -> new AdminMatchRow(
            group.getId(),
            group.getInterest().getName(),
            group.getCollege().getName(),
            group.getProjectType(),
            group.getConnectionType(),
            group.getStatus(),
            group.getLevelBand(),
            group.getMemberCount(),
            group.getMaxMembers(),
            names.getOrDefault(group.getId(), List.of()),
            group.getCreatedAt(),
            group.getOpenedAt()
        ));
    }

    /** The waiting queue, longest wait first — the view an operator acts on. */
    @Transactional(readOnly = true)
    public List<AdminQueueRow> waitingQueue() {
        List<MatchGroup> waiting =
            matchGroupRepository.findByStatusOldestFirst(MatchGroupStatus.WAITING);
        Map<UUID, List<String>> names = memberNames(waiting);

        List<AdminQueueRow> rows = new ArrayList<>(waiting.size());
        for (MatchGroup group : waiting) {
            rows.add(new AdminQueueRow(
                group.getId(),
                group.getInterest().getName(),
                group.getCollege().getName(),
                group.getProjectType(),
                group.getConnectionType(),
                group.getLevelBand(),
                group.getCreatedAt(),
                MatchAssembler.waitedSeconds(group),
                names.getOrDefault(group.getId(), List.of())
            ));
        }
        return rows;
    }

    @Transactional
    public MatchGroupResponse createMatch(CreateMatchRequest request) {
        Interest interest = interestRepository.findById(request.interestId())
            .orElseThrow(() -> new NotFoundException("Interest not found"));
        return matchingService.createManualMatch(
            request.userIds(),
            interest,
            request.connectionType(),
            request.projectType()
        );
    }

    @Transactional
    public void unmatch(UnmatchRequest request) {
        matchingService.unmatch(request.matchGroupId(), request.userId());
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminReportRow> reports(Pageable pageable) {
        return moderationService.reports(pageable);
    }

    @Transactional(readOnly = true)
    public PageResponse<InterestFeedbackRow> interestFeedback(Pageable pageable) {
        return PageResponse.from(
            interestFeedbackRepository.findAllByOrderByCreatedAtDesc(pageable),
            feedback -> new InterestFeedbackRow(
                feedback.getId(),
                feedback.getUser().getId(),
                feedback.getUser().getName(),
                feedback.getProjectType(),
                feedback.getSuggestion(),
                feedback.getCreatedAt()
            )
        );
    }

    @Transactional(readOnly = true)
    public long operatorCount() {
        return adminUserRepository.count();
    }

    private Map<UUID, List<String>> memberNames(List<MatchGroup> groups) {
        if (groups.isEmpty()) {
            return Map.of();
        }
        List<UUID> groupIds = groups.stream().map(MatchGroup::getId).toList();
        Map<UUID, List<String>> names = new HashMap<>();
        for (MatchMember member : matchMemberRepository.findActiveWithUserByGroupIdIn(groupIds)) {
            names
                .computeIfAbsent(member.getMatchGroup().getId(), key -> new ArrayList<>())
                .add(member.getUser().getName());
        }
        return names;
    }
}
