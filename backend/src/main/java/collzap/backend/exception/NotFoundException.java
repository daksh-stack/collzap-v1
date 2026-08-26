package collzap.backend.exception;

import org.springframework.http.HttpStatus;

public class NotFoundException extends ApiException {

    public NotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, "not_found", message);
    }

    public static NotFoundException of(String entity) {
        return new NotFoundException(entity + " not found");
    }
}
