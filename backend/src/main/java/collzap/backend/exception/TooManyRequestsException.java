package collzap.backend.exception;

import org.springframework.http.HttpStatus;

public class TooManyRequestsException extends ApiException {

    private final long retryAfterSeconds;

    public TooManyRequestsException(String message) {
        this(message, 0);
    }

    public TooManyRequestsException(String message, long retryAfterSeconds) {
        super(HttpStatus.TOO_MANY_REQUESTS, "rate_limited", message);
        this.retryAfterSeconds = retryAfterSeconds;
    }

    /** Seconds until the window resets, or 0 when unknown. */
    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
