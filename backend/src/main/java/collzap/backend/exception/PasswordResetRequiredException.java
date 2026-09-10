package collzap.backend.exception;

import org.springframework.http.HttpStatus;

/** Account exists but has no password yet — a legacy account, or an abandoned signup. */
public class PasswordResetRequiredException extends ApiException {

    public PasswordResetRequiredException(String message) {
        super(HttpStatus.CONFLICT, "password_reset_required", message);
    }
}
