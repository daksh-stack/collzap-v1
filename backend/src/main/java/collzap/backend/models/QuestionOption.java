package collzap.backend.models;

/** One MCQ option. Every option carries its own point value — there is no single "correct" choice. */
public record QuestionOption(String text, int points) {
}
