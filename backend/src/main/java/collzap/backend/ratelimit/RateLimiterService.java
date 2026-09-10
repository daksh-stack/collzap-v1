package collzap.backend.ratelimit;

import java.time.Duration;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

/**
 * Fixed-window request counter backed by a single Redis key per (limit, caller)
 * pair: {@code INCR} then, only on the first hit in a window, {@code PEXPIRE}.
 * One round trip, one atomic Lua script, negligible memory per key — sized for
 * a small single-instance Redis container, not a distributed rate-limiting
 * cluster.
 *
 * <p>Any Redis failure is logged and treated as "allow" — this is an abuse
 * guard, not a security boundary, and a Redis blip must never take down real
 * traffic.
 */
@Service
public class RateLimiterService {

    private static final Logger log = LoggerFactory.getLogger(RateLimiterService.class);

    private static final DefaultRedisScript<Long> INCREMENT_SCRIPT = new DefaultRedisScript<>("""
        local count = redis.call('INCR', KEYS[1])
        if tonumber(count) == 1 then
            redis.call('PEXPIRE', KEYS[1], ARGV[1])
        end
        return count
        """, Long.class);

    private final StringRedisTemplate redisTemplate;

    public RateLimiterService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /** True if this call is within the limit (and has been counted); false once the limit is exceeded. */
    public boolean tryConsume(String key, int limit, Duration window) {
        try {
            Long count = redisTemplate.execute(
                INCREMENT_SCRIPT,
                List.of(key),
                String.valueOf(window.toMillis())
            );
            return count != null && count <= limit;
        } catch (DataAccessException ex) {
            log.warn("Rate limiter could not reach Redis for key {}; allowing the request", key, ex);
            return true;
        }
    }
}
