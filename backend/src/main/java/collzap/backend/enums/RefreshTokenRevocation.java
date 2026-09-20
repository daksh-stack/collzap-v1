package collzap.backend.enums;

/**
 * Why a refresh token stopped being usable. The distinction is load-bearing:
 * {@link #ROTATED} is the only reason that earns a grace window, because it is the
 * only one where a second request carrying the same token is plausibly innocent
 * (two tabs refreshing at once, or a response lost on the way back). A token
 * revoked for any other reason is dead on arrival — an explicit logout must not be
 * undone by a late retry, and a token burned by reuse detection must never work
 * again, not even a millisecond later.
 */
public enum RefreshTokenRevocation {

    /** Replaced by a newer token during a normal refresh. */
    ROTATED,

    /** The user signed out, here or everywhere. */
    LOGOUT,

    /** Reuse was detected on this user's token chain; every token was burned. */
    COMPROMISED
}
