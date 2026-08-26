package collzap.backend.enums;

public enum MatchGroupStatus {
    /** Sitting in the queue, not yet enough members to open a chat. */
    WAITING,
    /** Chat room is live. Short groups in this state can still take members. */
    ACTIVE,
    /** Full or manually unmatched. Never returned to the matcher. */
    CLOSED
}
