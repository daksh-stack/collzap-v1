package collzap.backend.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import collzap.backend.dto.TestDtos.AnswerAcceptedResponse;
import collzap.backend.dto.TestDtos.SubmitAnswerRequest;
import collzap.backend.dto.TestDtos.TestEligibilityResponse;
import collzap.backend.dto.TestDtos.TestResultResponse;
import collzap.backend.dto.TestDtos.TestSessionResponse;
import collzap.backend.security.AuthPrincipal;
import collzap.backend.service.SeriousnessTestService;
import jakarta.validation.Valid;

/**
 * The seriousness test, for Long-Term interests only. Twenty-five questions cover
 * both of a user's interests in one sitting, and the whole paper is handed over on
 * start so the client can page through it offline and drop in the divider screen
 * when the interest changes.
 *
 * <p>Two things stay on the server by design: the timer, which is silent and is
 * enforced at submit rather than counted down in the UI, and scoring, which never
 * sends a correct-answer index to a client.
 */
@RestController
@RequestMapping("/api/test")
public class SeriousnessTestController {

    private final SeriousnessTestService testService;

    public SeriousnessTestController(SeriousnessTestService testService) {
        this.testService = testService;
    }

    /**
     * Whether the user may sit the test, and if not, the exact date the 30-day
     * retake lock lifts. Also reports an unfinished sitting so the app can resume.
     */
    @GetMapping("/eligibility")
    public TestEligibilityResponse eligibility(@AuthenticationPrincipal AuthPrincipal me) {
        return testService.eligibility(me.userId());
    }

    /** Starts a sitting, or hands back the in-progress one if there is a session already. */
    @PostMapping("/sessions")
    public ResponseEntity<TestSessionResponse> start(@AuthenticationPrincipal AuthPrincipal me) {
        return ResponseEntity.status(HttpStatus.CREATED).body(testService.start(me.userId()));
    }

    /** Restores an interrupted sitting, answers included. */
    @GetMapping("/sessions/current")
    public TestSessionResponse current(@AuthenticationPrincipal AuthPrincipal me) {
        return testService.currentSession(me.userId());
    }

    /** Records one answer and returns the progress counter for "Question X of 25". */
    @PostMapping("/sessions/{sessionId}/answers")
    public AnswerAcceptedResponse answer(
        @AuthenticationPrincipal AuthPrincipal me,
        @PathVariable UUID sessionId,
        @Valid @RequestBody SubmitAnswerRequest request
    ) {
        return testService.answer(me.userId(), sessionId, request);
    }

    /** Scores the sitting. Called after the last question; also runs on timer expiry. */
    @PostMapping("/sessions/{sessionId}/submit")
    public TestResultResponse submit(
        @AuthenticationPrincipal AuthPrincipal me,
        @PathVariable UUID sessionId
    ) {
        return testService.submit(me.userId(), sessionId);
    }

    /** The score screen: ring value, level label, per-interest tags, retake date. */
    @GetMapping("/sessions/{sessionId}/result")
    public TestResultResponse result(
        @AuthenticationPrincipal AuthPrincipal me,
        @PathVariable UUID sessionId
    ) {
        return testService.result(me.userId(), sessionId);
    }

    /** The most recent result, for re-opening the score screen later. */
    @GetMapping("/result")
    public TestResultResponse latestResult(@AuthenticationPrincipal AuthPrincipal me) {
        return testService.latestResult(me.userId());
    }
}
