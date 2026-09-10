package collzap.backend.controller;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import collzap.backend.dto.TestDtos.AnswerAcceptedResponse;
import collzap.backend.dto.TestDtos.SubmitAnswerRequest;
import collzap.backend.dto.TestDtos.TestEligibilityResponse;
import collzap.backend.dto.TestDtos.TestResultResponse;
import collzap.backend.dto.TestDtos.TestSessionResponse;
import collzap.backend.ratelimit.RateLimited;
import collzap.backend.security.AuthPrincipal;
import collzap.backend.service.SeriousnessTestService;
import jakarta.validation.Valid;

/**
 * The seriousness test, for Long-Term interests only. Twenty-five questions cover
 * both of a user's interests in one sitting, and the whole paper is handed over on
 * start so the client can page through it offline and drop in the divider screen
 * when the interest changes.
 *
 * <p>Scoring stays on the server by design — correct-answer indices are never sent
 * to the client.
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
    @RateLimited(name = "test-answer", limit = 60, windowSeconds = 60)
    @PostMapping("/answers")
    public AnswerAcceptedResponse answer(
        @AuthenticationPrincipal AuthPrincipal me,
        @Valid @RequestBody SubmitAnswerRequest request
    ) {
        return testService.answer(me.userId(), request);
    }

    /** Scores the sitting. Called after the last question. */
    @PostMapping("/submit")
    public TestResultResponse submit(
        @AuthenticationPrincipal AuthPrincipal me
    ) {
        return testService.submit(me.userId());
    }

    /** The score screen: ring value, level label, per-interest tags, retake date. */
    @GetMapping("/result")
    public TestResultResponse result(
        @AuthenticationPrincipal AuthPrincipal me
    ) {
        return testService.result(me.userId());
    }

    /** The most recent result, for re-opening the score screen later. */
    @GetMapping("/latest-result")
    public TestResultResponse latestResult(@AuthenticationPrincipal AuthPrincipal me) {
        return testService.latestResult(me.userId());
    }

    @PostMapping("/reset")
    public ResponseEntity<String> reset(@AuthenticationPrincipal AuthPrincipal me) {
        testService.emergencyReset(me.userId());
        return ResponseEntity.ok("Reset successful");
    }
}
