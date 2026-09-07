package collzap.backend.controller;

import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import collzap.backend.dto.CommonDtos.MessageResponse;
import collzap.backend.dto.MatchDtos.CircleResponse;
import collzap.backend.dto.MatchDtos.FindMatchesResponse;
import collzap.backend.dto.MatchDtos.MatchGroupResponse;
import collzap.backend.ratelimit.RateLimited;
import collzap.backend.security.AuthPrincipal;
import collzap.backend.service.MatchingService;

/**
 * Auto matching. {@code POST /find} runs the matcher for every interest the user
 * has set up and answers per interest: matched, queued, or already matched. When
 * an interest comes back MATCHED the chat room id is in the response, so the app
 * can open the conversation straight away.
 *
 * <p>A queued interest needs no further calls — the 30-second server sweep and the
 * match push will move it — but the client may re-POST while showing the loading
 * animation and get the same answer, because running the matcher is idempotent for
 * an interest that is already placed.
 */
@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchingService matchingService;

    public MatchController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    /** "Find My Peers". Same college, interest, level band and connection type. */
    @RateLimited(name = "match-find", limit = 10, windowSeconds = 60)
    @PostMapping("/find")
    public FindMatchesResponse find(@AuthenticationPrincipal AuthPrincipal me) {
        return matchingService.findMatches(me.userId());
    }

    /** The Circle tab: live connections plus anything still waiting. */
    @GetMapping("/circle")
    public CircleResponse circle(@AuthenticationPrincipal AuthPrincipal me) {
        return matchingService.circle(me.userId());
    }

    @GetMapping("/{groupId}")
    public MatchGroupResponse group(
        @AuthenticationPrincipal AuthPrincipal me,
        @PathVariable UUID groupId
    ) {
        return matchingService.group(me.userId(), groupId);
    }

    /** Leaves a group. A one-on-one partner is put back in the queue, not stranded. */
    @DeleteMapping("/{groupId}/members/me")
    public MessageResponse leave(
        @AuthenticationPrincipal AuthPrincipal me,
        @PathVariable UUID groupId
    ) {
        matchingService.unmatch(groupId, me.userId());
        return MessageResponse.of("You have left this connection");
    }
}
