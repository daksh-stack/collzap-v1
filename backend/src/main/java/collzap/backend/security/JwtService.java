package collzap.backend.security;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import collzap.backend.config.CollzapProperties;
import collzap.backend.exception.UnauthorizedException;
import collzap.backend.models.AdminUser;
import collzap.backend.models.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

/** Issues and validates the access tokens this backend owns. */
@Service
public class JwtService {

    private static final String CLAIM_EMAIL = "email";
    private static final String CLAIM_ADMIN = "admin";
    private static final String CLAIM_VERIFIED = "verified";

    private final CollzapProperties properties;
    private SecretKey signingKey;

    public JwtService(CollzapProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    void initKey() {
        String secret = properties.getJwt().getSecret();
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                "collzap.jwt.secret must be at least 32 bytes long for HS256 signing");
        }
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String issueUserToken(User user) {
        return issue(
            user.getId(),
            user.getEmail(),
            false,
            user.isVerified(),
            properties.getJwt().getAccessTokenTtl()
        );
    }

    public String issueAdminToken(AdminUser admin) {
        return issue(
            admin.getId(),
            admin.getUsername(),
            true,
            true,
            properties.getJwt().getAccessTokenTtl()
        );
    }

    private String issue(UUID subject, String email, boolean admin, boolean verified, Duration ttl) {
        Instant now = Instant.now();
        return Jwts.builder()
            .issuer(properties.getJwt().getIssuer())
            .subject(subject.toString())
            .claim(CLAIM_EMAIL, email)
            .claim(CLAIM_ADMIN, admin)
            .claim(CLAIM_VERIFIED, verified)
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plus(ttl)))
            .signWith(signingKey)
            .compact();
    }

    /** @throws UnauthorizedException when the token is absent, expired or tampered with */
    public AuthPrincipal parse(String token) {
        if (token == null || token.isBlank()) {
            throw new UnauthorizedException("Missing authentication token");
        }
        try {
            Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .requireIssuer(properties.getJwt().getIssuer())
                .build()
                .parseSignedClaims(token)
                .getPayload();
            return new AuthPrincipal(
                UUID.fromString(claims.getSubject()),
                claims.get(CLAIM_EMAIL, String.class),
                Boolean.TRUE.equals(claims.get(CLAIM_ADMIN, Boolean.class)),
                Boolean.TRUE.equals(claims.get(CLAIM_VERIFIED, Boolean.class))
            );
        } catch (JwtException | IllegalArgumentException ex) {
            throw new UnauthorizedException("Invalid or expired token");
        }
    }

    public long accessTokenTtlSeconds() {
        return properties.getJwt().getAccessTokenTtl().toSeconds();
    }
}
