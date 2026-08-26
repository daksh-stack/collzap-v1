package collzap.backend.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import collzap.backend.enums.SeriousnessLevel;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public final class TestDtos {

    private TestDtos() {
    }

    /**
     * The whole paper for a sitting. Questions carry their interest so the client
     * can drop in the divider screen when the interest changes, and the answered
     * index so a resumed sitting restores its state.
     *
     * <p>Deliberately carries no remaining-time field: the timer is silent.
     */
    public record TestSessionResponse(
        UUID sessionId,
        int totalQuestions,
        int answeredCount,
        Instant startedAt,
        List<TestQuestionResponse> questions
    ) {
    }

    public record TestQuestionResponse(
        int orderIndex,
        UUID questionId,
        UUID interestId,
        String interestName,
        String questionText,
        List<String> options,
        Integer selectedOptionIndex
    ) {
    }

    public record SubmitAnswerRequest(
        @NotNull(message = "Question is required")
        UUID questionId,

        @NotNull(message = "Select an option")
        @Min(value = 0, message = "Option index cannot be negative")
        Integer selectedOptionIndex
    ) {
    }

    public record AnswerAcceptedResponse(int answeredCount, int totalQuestions) {
    }

    public record TestResultResponse(
        UUID sessionId,
        Instant submittedAt,
        boolean autoSubmitted,
        int overallScore,
        SeriousnessLevel overallLevel,
        String message,
        LocalDate nextRetakeDate,
        List<InterestResultResponse> results
    ) {
    }

    public record InterestResultResponse(
        UUID interestId,
        String interestName,
        int questionCount,
        int correctCount,
        int score,
        SeriousnessLevel level,
        String message,
        LocalDate nextRetakeDate
    ) {
    }

    /** Drives the "Retake in 30 days" link, including the exact unlock date. */
    public record TestEligibilityResponse(
        boolean eligible,
        String reason,
        LocalDate nextRetakeDate,
        boolean hasInProgressSession,
        UUID inProgressSessionId
    ) {
    }
}
