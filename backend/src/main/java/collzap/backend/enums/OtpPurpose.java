package collzap.backend.enums;

public enum OtpPurpose {
    /** Confirms the login email during signup (or a resend of that same check). */
    SIGNUP,
    /** Confirms a college email during the verification step, separate from the login email. */
    COLLEGE_VERIFY,
    PASSWORD_RESET
}
