package collzap.backend.security;

import java.util.List;
import java.util.Objects;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import collzap.backend.exception.UnauthorizedException;

/**
 * Authenticates the STOMP CONNECT frame. The HTTP upgrade itself is open (a
 * browser WebSocket cannot set an Authorization header), so the token travels in
 * the CONNECT frame's native headers and the resolved principal is pinned to the
 * session for the rest of its life.
 */
@Component
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;

    public StompAuthChannelInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || !StompCommand.CONNECT.equals(accessor.getCommand())) {
            return message;
        }

        AuthPrincipal principal = jwtService.parse(extractToken(accessor));
        if (principal.admin()) {
            throw new UnauthorizedException("Admin tokens cannot open chat sockets");
        }
        accessor.setUser(new UsernamePasswordAuthenticationToken(
            principal,
            null,
            List.of(new SimpleGrantedAuthority(principal.authority()))
        ));
        return message;
    }

    private String extractToken(StompHeaderAccessor accessor) {
        String header = firstNativeHeader(accessor, "Authorization");
        if (header != null && header.startsWith(BEARER_PREFIX)) {
            return header.substring(BEARER_PREFIX.length()).trim();
        }
        // Fallback for clients that cannot set Authorization on CONNECT.
        String token = firstNativeHeader(accessor, "token");
        if (token == null || token.isBlank()) {
            throw new UnauthorizedException("Missing authentication token on CONNECT");
        }
        return token;
    }

    private String firstNativeHeader(StompHeaderAccessor accessor, String name) {
        List<String> values = accessor.getNativeHeader(name);
        return values == null || values.isEmpty() ? null : values.getFirst();
    }

    /** Resolves the principal pinned at CONNECT for any later frame. */
    public static AuthPrincipal principalOf(StompHeaderAccessor accessor) {
        Objects.requireNonNull(accessor, "accessor");
        if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken token
            && token.getPrincipal() instanceof AuthPrincipal principal) {
            return principal;
        }
        throw new UnauthorizedException("WebSocket session is not authenticated");
    }
}
