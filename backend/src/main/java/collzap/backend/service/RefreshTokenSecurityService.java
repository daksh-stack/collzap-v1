package collzap.backend.service;

import java.time.Instant;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import collzap.backend.repositories.RefreshTokenRepository;

/**
 * Burning a user's refresh tokens after reuse is detected, in its own transaction.
 *
 * <p>This exists as a separate bean for one reason: {@code REQUIRES_NEW} only takes
 * effect through Spring's proxy, and a call from inside {@link AuthService} to one of
 * its own methods would bypass that proxy and silently join the caller's transaction
 * instead. The caller then throws {@code UnauthorizedException} to report the theft,
 * and whether that revocation survives would depend entirely on rollback rules —
 * exactly the kind of invisible coupling that makes security code fail quietly.
 * Committing in a transaction of its own makes the revocation independent of what the
 * caller does next.
 */
@Service
public class RefreshTokenSecurityService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenSecurityService.class);

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenSecurityService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    /** Ends every session this user has. Returns how many tokens were burned. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public int compromiseAllForUser(UUID userId) {
        int burned = refreshTokenRepository.compromiseAllForUser(userId, Instant.now());
        log.warn("Refresh token reuse detected for user {}; burned {} token(s)", userId, burned);
        return burned;
    }
}
