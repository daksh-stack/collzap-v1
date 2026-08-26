package collzap.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import collzap.backend.dto.CommonDtos.MessageResponse;
import collzap.backend.dto.ModerationDtos.BlockRequest;
import collzap.backend.dto.ModerationDtos.BlockedUserResponse;
import collzap.backend.dto.ModerationDtos.ReportRequest;
import collzap.backend.security.AuthPrincipal;
import collzap.backend.service.ModerationService;
import jakarta.validation.Valid;

/**
 * Privacy &amp; Safety. Blocking is immediate and destructive: any group the two
 * share is dissolved and the matcher will not put them together again. Reporting
 * files the complaint for an operator without breaking the connection, so someone
 * can report and keep talking, or report and block.
 */
@RestController
@RequestMapping("/api/safety")
public class ModerationController {

    private final ModerationService moderationService;

    public ModerationController(ModerationService moderationService) {
        this.moderationService = moderationService;
    }

    @PostMapping("/block")
    public MessageResponse block(
        @AuthenticationPrincipal AuthPrincipal me,
        @Valid @RequestBody BlockRequest request
    ) {
        moderationService.block(me.userId(), request.userId());
        return MessageResponse.of("Blocked. You will not be matched again.");
    }

    @DeleteMapping("/block/{userId}")
    public MessageResponse unblock(
        @AuthenticationPrincipal AuthPrincipal me,
        @PathVariable UUID userId
    ) {
        moderationService.unblock(me.userId(), userId);
        return MessageResponse.of("Unblocked");
    }

    @GetMapping("/blocked")
    public List<BlockedUserResponse> blocked(@AuthenticationPrincipal AuthPrincipal me) {
        return moderationService.blockedUsers(me.userId());
    }

    @PostMapping("/report")
    public MessageResponse report(
        @AuthenticationPrincipal AuthPrincipal me,
        @Valid @RequestBody ReportRequest request
    ) {
        moderationService.report(me.userId(), request);
        return MessageResponse.of("Thanks for telling us. Our team will review this.");
    }
}
