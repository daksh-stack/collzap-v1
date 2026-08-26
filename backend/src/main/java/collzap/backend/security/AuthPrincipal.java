package collzap.backend.security;

import java.security.Principal;
import java.util.UUID;

/**
 * Authenticated caller, attached as the Spring Security principal and reused as
 * the STOMP {@link Principal} on WebSocket sessions.
 *
 * @param userId  user id, or admin id when {@code admin} is true
 * @param email   user email, or admin username
 * @param admin   true for /admin dashboard operators
 * @param verified whether the user's college verification has been approved
 */
public record AuthPrincipal(UUID userId, String email, boolean admin, boolean verified) implements Principal {

    @Override
    public String getName() {
        return userId.toString();
    }

    public String authority() {
        return admin ? "ROLE_ADMIN" : "ROLE_USER";
    }
}
