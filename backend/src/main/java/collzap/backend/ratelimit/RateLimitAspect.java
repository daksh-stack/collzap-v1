package collzap.backend.ratelimit;

import java.time.Duration;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import collzap.backend.exception.TooManyRequestsException;
import collzap.backend.security.AuthPrincipal;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Enforces {@link RateLimited} on the controller methods it annotates. The
 * caller is identified by their authenticated user id when one exists (and
 * the annotation allows it), otherwise by IP — which is the only option for
 * the permitAll endpoints (OTP, admin login) this also guards.
 */
@Aspect
@Component
public class RateLimitAspect {

    private final RateLimiterService rateLimiterService;

    public RateLimitAspect(RateLimiterService rateLimiterService) {
        this.rateLimiterService = rateLimiterService;
    }

    @Around("@annotation(rateLimited)")
    public Object enforce(ProceedingJoinPoint joinPoint, RateLimited rateLimited) throws Throwable {
        String identity = resolveIdentity(rateLimited.keyType());
        String key = "ratelimit:%s:%s".formatted(rateLimited.name(), identity);

        boolean allowed = rateLimiterService.tryConsume(
            key,
            rateLimited.limit(),
            Duration.ofSeconds(rateLimited.windowSeconds())
        );

        if (!allowed) {
            long wait = rateLimiterService.secondsUntilReset(key);
            throw new TooManyRequestsException(waitMessage(wait), wait);
        }
        return joinPoint.proceed();
    }

    private static String waitMessage(long seconds) {
        if (seconds <= 0) {
            return "Too many requests. Try again in a moment.";
        }
        if (seconds < 90) {
            return "Too many requests. Try again in " + seconds + " seconds.";
        }
        long minutes = (seconds + 59) / 60;
        if (minutes < 90) {
            return "Too many requests. Try again in " + minutes + " minutes.";
        }
        long hours = (minutes + 59) / 60;
        return "Too many requests. Try again in about " + hours + " hours.";
    }

    private String resolveIdentity(RateLimited.KeyType keyType) {
        if (keyType == RateLimited.KeyType.USER_OR_IP) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof AuthPrincipal principal) {
                return "user:" + principal.userId();
            }
        }
        return "ip:" + clientIp();
    }

    private String clientIp() {
        if (!(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes)) {
            return "unknown";
        }
        HttpServletRequest request = attributes.getRequest();
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
