package collzap.backend.service;

import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import collzap.backend.dto.AdminDtos.AdminReportRow;
import collzap.backend.dto.CommonDtos.PageResponse;
import collzap.backend.dto.ModerationDtos.BlockedUserResponse;
import collzap.backend.dto.ModerationDtos.ReportRequest;
import collzap.backend.enums.ModerationAction;
import collzap.backend.exception.BadRequestException;
import collzap.backend.exception.ConflictException;
import collzap.backend.models.BlockReport;
import collzap.backend.models.User;
import collzap.backend.repositories.BlockReportRepository;

/**
 * Privacy &amp; Safety. A block is not just a filter for future matching: any group
 * the two users currently share is torn down straight away, because leaving them
 * in a live chat together would defeat the point.
 */
@Service
public class ModerationService {

    private static final Logger log = LoggerFactory.getLogger(ModerationService.class);

    private final BlockReportRepository blockReportRepository;
    private final MatchingService matchingService;
    private final UserService userService;

    public ModerationService(
        BlockReportRepository blockReportRepository,
        MatchingService matchingService,
        UserService userService
    ) {
        this.blockReportRepository = blockReportRepository;
        this.matchingService = matchingService;
        this.userService = userService;
    }

    @Transactional
    public void block(UUID userId, UUID targetId) {
        User reporter = userService.require(userId);
        User reported = requireOther(userId, targetId);

        if (blockReportRepository.existsByReporterIdAndReportedIdAndActionType(
            userId, targetId, ModerationAction.BLOCK)) {
            throw new ConflictException("You have already blocked %s".formatted(reported.getName()));
        }
        blockReportRepository.save(
            new BlockReport(reporter, reported, ModerationAction.BLOCK, null));

        // Dissolve, not just remove: a one-on-one has nothing left, and in a group the
        // blocked pair must not stay in the same room.
        List<UUID> shared = matchingService.sharedActiveGroupIds(userId, targetId);
        shared.forEach(groupId -> matchingService.unmatch(groupId, null));
        if (!shared.isEmpty()) {
            log.info("Block by {} dissolved {} shared group(s)", userId, shared.size());
        }
    }

    @Transactional
    public void unblock(UUID userId, UUID targetId) {
        userService.require(userId);
        if (!blockReportRepository.existsByReporterIdAndReportedIdAndActionType(
            userId, targetId, ModerationAction.BLOCK)) {
            throw new BadRequestException("That user is not blocked");
        }
        blockReportRepository.deleteByReporterIdAndReportedIdAndActionType(
            userId, targetId, ModerationAction.BLOCK);
    }

    @Transactional(readOnly = true)
    public List<BlockedUserResponse> blockedUsers(UUID userId) {
        return blockReportRepository.findBlocksByReporterId(userId).stream()
            .map(block -> new BlockedUserResponse(
                block.getReported().getId(),
                block.getReported().getName(),
                block.getReported().getProfilePhotoUrl(),
                block.getCreatedAt()
            ))
            .toList();
    }

    /**
     * A report is recorded for the admin queue but does not itself sever the match —
     * an operator decides. Users who also want the person gone can block them.
     */
    @Transactional
    public void report(UUID userId, ReportRequest request) {
        User reporter = userService.require(userId);
        User reported = requireOther(userId, request.userId());
        blockReportRepository.save(
            new BlockReport(reporter, reported, ModerationAction.REPORT, request.reason().trim()));
        log.info("User {} reported user {}", userId, request.userId());
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminReportRow> reports(Pageable pageable) {
        return PageResponse.from(
            blockReportRepository.findByActionType(ModerationAction.REPORT, pageable),
            report -> new AdminReportRow(
                report.getId(),
                report.getReporter().getId(),
                report.getReporter().getName(),
                report.getReported().getId(),
                report.getReported().getName(),
                report.getReason(),
                report.getCreatedAt()
            )
        );
    }

    private User requireOther(UUID userId, UUID targetId) {
        if (userId.equals(targetId)) {
            throw new BadRequestException("You cannot do that to yourself");
        }
        return userService.require(targetId);
    }
}
