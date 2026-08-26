package collzap.backend.enums;

public enum TestAttemptStatus {
    IN_PROGRESS,
    SUBMITTED,
    /** Left behind because the user hit back and restarted the test. */
    ABANDONED
}
