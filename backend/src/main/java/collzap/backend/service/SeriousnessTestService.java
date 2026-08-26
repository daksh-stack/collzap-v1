package collzap.backend.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import collzap.backend.config.CollzapProperties;
import collzap.backend.dto.TestDtos.AnswerAcceptedResponse;
import collzap.backend.dto.TestDtos.InterestResultResponse;
import collzap.backend.dto.TestDtos.SubmitAnswerRequest;
import collzap.backend.dto.TestDtos.TestEligibilityResponse;
import collzap.backend.dto.TestDtos.TestQuestionResponse;
import collzap.backend.dto.TestDtos.TestResultResponse;
import collzap.backend.dto.TestDtos.TestSessionResponse;
import collzap.backend.enums.ProjectType;
import collzap.backend.enums.SeriousnessLevel;
import collzap.backend.enums.TestAttemptStatus;
import collzap.backend.exception.BadRequestException;
import collzap.backend.exception.ConflictException;
import collzap.backend.exception.ForbiddenException;
import collzap.backend.exception.NotFoundException;
import collzap.backend.models.Interest;
import collzap.backend.models.SeriousnessTestAnswer;
import collzap.backend.models.SeriousnessTestAttempt;
import collzap.backend.models.SeriousnessTestQuestion;
import collzap.backend.models.SeriousnessTestSession;
import collzap.backend.models.SeriousnessTestSessionQuestion;
import collzap.backend.models.User;
import collzap.backend.models.UserInterestSelection;
import collzap.backend.repositories.SeriousnessTestAnswerRepository;
import collzap.backend.repositories.SeriousnessTestAttemptRepository;
import collzap.backend.repositories.SeriousnessTestQuestionRepository;
import collzap.backend.repositories.SeriousnessTestSessionQuestionRepository;
import collzap.backend.repositories.SeriousnessTestSessionRepository;
import collzap.backend.repositories.UserInterestSelectionRepository;
import collzap.backend.repositories.UserProjectTypeSelectionRepository;

/**
 * The Long-Term seriousness test. One sitting covers every Long-Term interest the
 * user picked: the configured question total is split across them, drawn at random
 * from each interest's bank, and scored here on the server.
 *
 * <p>The timer is silent by design — nothing in the session payload tells the
 * client how long is left. When it runs out the sitting is submitted with whatever
 * was answered, and unanswered questions simply score zero.
 */
@Service
public class SeriousnessTestService {

    private static final Logger log = LoggerFactory.getLogger(SeriousnessTestService.class);

    private final SeriousnessTestSessionRepository sessionRepository;
    private final SeriousnessTestSessionQuestionRepository sessionQuestionRepository;
    private final SeriousnessTestAttemptRepository attemptRepository;
    private final SeriousnessTestAnswerRepository answerRepository;
    private final SeriousnessTestQuestionRepository questionRepository;
    private final UserInterestSelectionRepository selectionRepository;
    private final UserProjectTypeSelectionRepository projectTypeRepository;
    private final UserService userService;
    private final CollzapProperties properties;

    public SeriousnessTestService(
        SeriousnessTestSessionRepository sessionRepository,
        SeriousnessTestSessionQuestionRepository sessionQuestionRepository,
        SeriousnessTestAttemptRepository attemptRepository,
        SeriousnessTestAnswerRepository answerRepository,
        SeriousnessTestQuestionRepository questionRepository,
        UserInterestSelectionRepository selectionRepository,
        UserProjectTypeSelectionRepository projectTypeRepository,
        UserService userService,
        CollzapProperties properties
    ) {
        this.sessionRepository = sessionRepository;
        this.sessionQuestionRepository = sessionQuestionRepository;
        this.attemptRepository = attemptRepository;
        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
        this.selectionRepository = selectionRepository;
        this.projectTypeRepository = projectTypeRepository;
        this.userService = userService;
        this.properties = properties;
    }

    @Transactional(readOnly = true)
    public TestEligibilityResponse eligibility(UUID userId) {
        userService.require(userId);
        Optional<SeriousnessTestSession> inProgress = sessionRepository
            .findFirstByUserIdAndStatusOrderByCreatedAtDesc(userId, TestAttemptStatus.IN_PROGRESS);

        if (!projectTypeRepository.existsByUserIdAndProjectType(userId, ProjectType.LONG_TERM)) {
            return new TestEligibilityResponse(
                false,
                "The seriousness test is only for Long-Term Peer matching.",
                null,
                inProgress.isPresent(),
                inProgress.map(SeriousnessTestSession::getId).orElse(null)
            );
        }

        List<UserInterestSelection> selections = longTermSelections(userId);
        if (selections.isEmpty()) {
            return new TestEligibilityResponse(
                false,
                "Pick your Long-Term interests first.",
                null,
                inProgress.isPresent(),
                inProgress.map(SeriousnessTestSession::getId).orElse(null)
            );
        }

        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate lockedUntil = null;
        for (UserInterestSelection selection : selections) {
            LocalDate retake = latestSubmitted(userId, selection.getInterest().getId())
                .map(SeriousnessTestAttempt::getNextRetakeDate)
                .orElse(null);
            if (retake != null && retake.isAfter(today)
                && (lockedUntil == null || retake.isAfter(lockedUntil))) {
                lockedUntil = retake;
            }
        }
        if (lockedUntil != null) {
            return new TestEligibilityResponse(
                false,
                "You can retake the test on %s.".formatted(lockedUntil),
                lockedUntil,
                inProgress.isPresent(),
                inProgress.map(SeriousnessTestSession::getId).orElse(null)
            );
        }
        return new TestEligibilityResponse(
            true,
            null,
            null,
            inProgress.isPresent(),
            inProgress.map(SeriousnessTestSession::getId).orElse(null)
        );
    }

    /**
     * Builds a fresh sitting. Any sitting still open is abandoned first, which is
     * also what the back button relies on: going back and starting again gives a new
     * randomised paper from question one.
     */
    @Transactional
    public TestSessionResponse start(UUID userId) {
        User user = userService.require(userId);
        TestEligibilityResponse eligibility = eligibility(userId);
        if (!eligibility.eligible()) {
            throw new ConflictException(eligibility.reason());
        }

        Instant now = Instant.now();
        sessionRepository.findByUserIdAndStatus(userId, TestAttemptStatus.IN_PROGRESS)
            .forEach(open -> {
                open.setStatus(TestAttemptStatus.ABANDONED);
                sessionRepository.save(open);
                attemptRepository.findBySessionId(open.getId()).forEach(attempt -> {
                    attempt.setStatus(TestAttemptStatus.ABANDONED);
                    attemptRepository.save(attempt);
                });
            });

        List<UserInterestSelection> selections = longTermSelections(userId);
        List<Interest> interests = selections.stream().map(UserInterestSelection::getInterest).toList();
        Map<Interest, List<SeriousnessTestQuestion>> paper = drawPaper(interests);

        int actualTotal = paper.values().stream().mapToInt(List::size).sum();
        SeriousnessTestSession session = sessionRepository.save(new SeriousnessTestSession(
            user,
            actualTotal,
            now,
            now.plus(properties.getSeriousnessTest().getDuration())
        ));

        int orderIndex = 0;
        for (Map.Entry<Interest, List<SeriousnessTestQuestion>> entry : paper.entrySet()) {
            SeriousnessTestAttempt attempt = attemptRepository.save(new SeriousnessTestAttempt(
                session,
                user,
                entry.getKey(),
                entry.getValue().size()
            ));
            for (SeriousnessTestQuestion question : entry.getValue()) {
                sessionQuestionRepository.save(
                    new SeriousnessTestSessionQuestion(session, attempt, question, orderIndex++));
            }
        }
        return describe(session);
    }

    @Transactional(readOnly = true)
    public TestSessionResponse currentSession(UUID userId) {
        SeriousnessTestSession session = sessionRepository
            .findFirstByUserIdAndStatusOrderByCreatedAtDesc(userId, TestAttemptStatus.IN_PROGRESS)
            .orElseThrow(() -> new NotFoundException("No test in progress"));
        return describe(session);
    }

    @Transactional
    public AnswerAcceptedResponse answer(UUID userId, UUID sessionId, SubmitAnswerRequest request) {
        SeriousnessTestSession session = requireOwnSession(userId, sessionId);
        Instant now = Instant.now();

        if (session.getStatus() != TestAttemptStatus.IN_PROGRESS) {
            throw new ConflictException("This test has already been submitted");
        }
        if (session.isExpired(now)) {
            // The timer is silent, so the client finds out here rather than from a countdown.
            finalise(session, true, now);
            throw new ConflictException("This test has already been submitted");
        }

        SeriousnessTestSessionQuestion paperEntry = sessionQuestionRepository
            .findBySessionIdAndQuestionId(sessionId, request.questionId())
            .orElseThrow(() -> new NotFoundException("That question is not part of this test"));

        SeriousnessTestQuestion question = paperEntry.getQuestion();
        int selected = request.selectedOptionIndex();
        if (selected >= question.getOptions().size()) {
            throw new BadRequestException("That option does not exist for this question");
        }

        SeriousnessTestAttempt attempt = paperEntry.getAttempt();
        boolean correct = selected == question.getCorrectOptionIndex();
        SeriousnessTestAnswer answer = answerRepository
            .findByAttemptIdAndQuestionId(attempt.getId(), question.getId())
            .orElseGet(() -> new SeriousnessTestAnswer(attempt, question, selected, correct));
        answer.setSelectedOptionIndex(selected);
        answer.setCorrect(correct);
        answerRepository.save(answer);

        return new AnswerAcceptedResponse(
            (int) answerRepository.countBySessionId(sessionId),
            session.getTotalQuestions()
        );
    }

    @Transactional
    public TestResultResponse submit(UUID userId, UUID sessionId) {
        SeriousnessTestSession session = requireOwnSession(userId, sessionId);
        if (session.getStatus() == TestAttemptStatus.SUBMITTED) {
            return buildResult(session);
        }
        if (session.getStatus() != TestAttemptStatus.IN_PROGRESS) {
            throw new ConflictException("This test was abandoned. Start a new one.");
        }
        Instant now = Instant.now();
        finalise(session, session.isExpired(now), now);
        return buildResult(session);
    }

    @Transactional(readOnly = true)
    public TestResultResponse result(UUID userId, UUID sessionId) {
        SeriousnessTestSession session = requireOwnSession(userId, sessionId);
        if (session.getStatus() != TestAttemptStatus.SUBMITTED) {
            throw new ConflictException("This test has not been submitted yet");
        }
        return buildResult(session);
    }

    @Transactional(readOnly = true)
    public TestResultResponse latestResult(UUID userId) {
        SeriousnessTestSession session = sessionRepository
            .findFirstByUserIdAndStatusOrderByCreatedAtDesc(userId, TestAttemptStatus.SUBMITTED)
            .orElseThrow(() -> new NotFoundException("You have not taken the test yet"));
        return buildResult(session);
    }

    /**
     * Called by the scheduler. Sittings whose silent timer ran out are scored with
     * whatever was answered.
     *
     * @return how many sittings were closed
     */
    @Transactional
    public int autoSubmitExpired() {
        Instant now = Instant.now();
        List<SeriousnessTestSession> expired = sessionRepository.findExpiredInProgress(now);
        for (SeriousnessTestSession session : expired) {
            finalise(session, true, now);
            log.info("Auto-submitted expired seriousness test {} for user {}",
                session.getId(), session.getUser().getId());
        }
        return expired.size();
    }

    /**
     * Splits the question total evenly across the chosen interests, giving the
     * remainder to the earlier ones. Insertion order is preserved so the client can
     * show its divider screen when the interest changes.
     */
    private Map<Interest, List<SeriousnessTestQuestion>> drawPaper(List<Interest> interests) {
        int total = properties.getSeriousnessTest().getTotalQuestions();
        int base = total / interests.size();
        int remainder = total % interests.size();

        Map<Interest, List<SeriousnessTestQuestion>> paper = new LinkedHashMap<>();
        for (int i = 0; i < interests.size(); i++) {
            Interest interest = interests.get(i);
            int wanted = base + (i < remainder ? 1 : 0);
            List<SeriousnessTestQuestion> drawn =
                questionRepository.pickRandomForInterest(interest.getId(), wanted);
            if (drawn.isEmpty()) {
                throw new ConflictException(
                    "The question bank for %s is not ready yet. Try again later."
                        .formatted(interest.getName()));
            }
            if (drawn.size() < wanted) {
                log.warn("Question bank for interest {} holds {} of the {} questions needed",
                    interest.getName(), drawn.size(), wanted);
            }
            paper.put(interest, drawn);
        }
        return paper;
    }

    /** Scores every attempt in the sitting and closes it. */
    private void finalise(SeriousnessTestSession session, boolean autoSubmitted, Instant now) {
        LocalDate retakeDate = LocalDate.now(ZoneOffset.UTC)
            .plusDays(properties.getSeriousnessTest().getRetakeLockDays());

        for (SeriousnessTestAttempt attempt : attemptRepository.findWithInterestBySessionId(session.getId())) {
            int correct = (int) answerRepository.countByAttemptIdAndCorrectTrue(attempt.getId());
            attempt.setCorrectCount(correct);
            attempt.setScore(percent(correct, attempt.getQuestionCount()));
            attempt.setLevel(SeriousnessLevel.fromScore(attempt.getScore()));
            attempt.setStatus(TestAttemptStatus.SUBMITTED);
            attempt.setSubmittedAt(now);
            attempt.setNextRetakeDate(retakeDate);
            attemptRepository.save(attempt);
        }

        session.setStatus(TestAttemptStatus.SUBMITTED);
        session.setSubmittedAt(now);
        session.setAutoSubmitted(autoSubmitted);
        sessionRepository.save(session);
    }

    private TestResultResponse buildResult(SeriousnessTestSession session) {
        List<SeriousnessTestAttempt> attempts =
            attemptRepository.findWithInterestBySessionId(session.getId());

        int totalCorrect = attempts.stream().mapToInt(SeriousnessTestAttempt::getCorrectCount).sum();
        int totalQuestions = attempts.stream().mapToInt(SeriousnessTestAttempt::getQuestionCount).sum();
        int overallScore = percent(totalCorrect, totalQuestions);
        SeriousnessLevel overallLevel = SeriousnessLevel.fromScore(overallScore);

        LocalDate nextRetake = attempts.stream()
            .map(SeriousnessTestAttempt::getNextRetakeDate)
            .filter(java.util.Objects::nonNull)
            .max(LocalDate::compareTo)
            .orElse(null);

        List<InterestResultResponse> perInterest = attempts.stream()
            .map(attempt -> new InterestResultResponse(
                attempt.getInterest().getId(),
                attempt.getInterest().getName(),
                attempt.getQuestionCount(),
                attempt.getCorrectCount(),
                attempt.getScore() == null ? 0 : attempt.getScore(),
                attempt.getLevel(),
                attempt.getLevel() == null ? null : attempt.getLevel().message(),
                attempt.getNextRetakeDate()
            ))
            .toList();

        return new TestResultResponse(
            session.getId(),
            session.getSubmittedAt(),
            session.isAutoSubmitted(),
            overallScore,
            overallLevel,
            overallLevel.message(),
            nextRetake,
            perInterest
        );
    }

    private TestSessionResponse describe(SeriousnessTestSession session) {
        List<SeriousnessTestSessionQuestion> paper =
            sessionQuestionRepository.findPaperBySessionId(session.getId());

        Map<UUID, Integer> selectedByQuestion = new HashMap<>();
        for (SeriousnessTestAnswer answer : answerRepository.findBySessionId(session.getId())) {
            selectedByQuestion.put(answer.getQuestion().getId(), answer.getSelectedOptionIndex());
        }

        List<TestQuestionResponse> questions = new ArrayList<>(paper.size());
        for (SeriousnessTestSessionQuestion entry : paper) {
            SeriousnessTestQuestion question = entry.getQuestion();
            questions.add(new TestQuestionResponse(
                entry.getOrderIndex(),
                question.getId(),
                question.getInterest().getId(),
                question.getInterest().getName(),
                question.getQuestionText(),
                // Never the correct index — scoring stays on the server.
                List.copyOf(question.getOptions()),
                selectedByQuestion.get(question.getId())
            ));
        }

        return new TestSessionResponse(
            session.getId(),
            session.getTotalQuestions(),
            selectedByQuestion.size(),
            session.getStartedAt(),
            session.getExpiresAt(),
            questions
        );
    }

    private SeriousnessTestSession requireOwnSession(UUID userId, UUID sessionId) {
        SeriousnessTestSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new NotFoundException("Test session not found"));
        if (!session.getUser().getId().equals(userId)) {
            throw new ForbiddenException("That test session belongs to someone else");
        }
        return session;
    }

    private List<UserInterestSelection> longTermSelections(UUID userId) {
        return selectionRepository.findAllWithInterestByUserIdAndProjectType(userId, ProjectType.LONG_TERM);
    }

    private Optional<SeriousnessTestAttempt> latestSubmitted(UUID userId, UUID interestId) {
        return attemptRepository.findFirstByUserIdAndInterestIdAndStatusOrderBySubmittedAtDesc(
            userId, interestId, TestAttemptStatus.SUBMITTED);
    }

    static int percent(int correct, int total) {
        if (total <= 0) {
            return 0;
        }
        return (int) Math.round(100.0 * correct / total);
    }

    @Transactional
    public void emergencyReset(UUID userId) {
        sessionRepository.findByUserIdAndStatus(userId, TestAttemptStatus.IN_PROGRESS)
            .forEach(open -> {
                open.setStatus(TestAttemptStatus.ABANDONED);
                sessionRepository.save(open);
                attemptRepository.findBySessionId(open.getId()).forEach(attempt -> {
                    attempt.setStatus(TestAttemptStatus.ABANDONED);
                    attemptRepository.save(attempt);
                });
            });
    }
}
