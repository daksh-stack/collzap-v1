package collzap.backend.enums;

/**
 * Where a user is in the onboarding funnel. Returned with auth responses and
 * from {@code GET /api/me/state} so the client always knows which screen to show.
 */
public enum OnboardingStep {
    /** Signed up, but the login email is not confirmed yet. */
    VERIFY_EMAIL,
    /** Email confirmed, but student verification (document or college email) not done yet. */
    UPLOAD_DOCUMENT,
    /** Document submitted, admin has not reviewed it — the clock icon state. */
    AWAITING_VERIFICATION,
    /** Admin rejected the document; the user may upload another. */
    VERIFICATION_REJECTED,
    COMPLETE_PROFILE,
    SELECT_PROJECT_TYPE,
    SELECT_INTERESTS,
    TAKE_SERIOUSNESS_TEST,
    SELECT_CONNECTION_TYPE,
    /** Onboarding done — the home and match tabs are fully usable. */
    READY
}
