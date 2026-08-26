package collzap.backend.exception;

import java.time.Instant;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
    Instant timestamp,
    int status,
    String code,
    String message,
    String path,
    Map<String, String> fieldErrors
) {
    public static ApiError of(int status, String code, String message, String path) {
        return new ApiError(Instant.now(), status, code, message, path, null);
    }

    public static ApiError validation(int status, String message, String path, Map<String, String> fieldErrors) {
        return new ApiError(Instant.now(), status, "validation_failed", message, path, fieldErrors);
    }
}
