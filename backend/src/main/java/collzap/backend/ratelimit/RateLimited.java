package collzap.backend.ratelimit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Caps how often a controller method can be called, per caller. Backed by a
 * fixed-window counter in Redis (see {@link RateLimiterService}) that fails
 * open if Redis is unreachable — a Redis hiccup never blocks real traffic.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimited {

    /** Namespaces the Redis key for this limit, e.g. "otp-request". */
    String name();

    /** Requests allowed per window. */
    int limit();

    /** Window length, in seconds. */
    long windowSeconds();

    /** How to identify the caller. */
    KeyType keyType() default KeyType.USER_OR_IP;

    enum KeyType {
        /** The authenticated user's id. Falls back to IP if unauthenticated. */
        USER_OR_IP,
        /** Always the caller's IP address — for endpoints with no principal yet (OTP, login). */
        IP
    }
}
