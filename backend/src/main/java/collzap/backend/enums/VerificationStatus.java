package collzap.backend.enums;

/**
 * Lifecycle of a user's college verification. Users start PENDING, move to
 * DOCUMENT_SUBMITTED once a fee slip / ID card is uploaded, and an admin then
 * moves them to APPROVED or REJECTED.
 */
public enum VerificationStatus {
    PENDING,
    DOCUMENT_SUBMITTED,
    APPROVED,
    REJECTED
}
