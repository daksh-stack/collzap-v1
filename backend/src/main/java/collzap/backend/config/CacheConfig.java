package collzap.backend.config;

import java.time.Duration;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.cache.autoconfigure.RedisCacheManagerBuilderCustomizer;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.JacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import collzap.backend.dto.CollegeDtos.CollegeResponse;
import collzap.backend.dto.InterestDtos.InterestCatalogResponse;
import collzap.backend.models.College;
import tools.jackson.databind.type.TypeFactory;

/**
 * Redis-backed caching for small, rarely-changing reference data (the interest
 * catalog, the college list). Each cache gets a serializer bound to its exact
 * value type rather than one generic/polymorphic serializer — simpler and more
 * reliable than default-typing, which doesn't round-trip a bare {@code List} at
 * the cache boundary (Spring Cache always deserializes with a raw
 * {@code Object} hint, and Jackson's default typing needs a real hint at the
 * root to know it's looking at a collection instead of a wrapped type id).
 *
 * <p>Errors talking to Redis are logged and swallowed rather than propagated,
 * so a Redis hiccup degrades to hitting the database directly instead of
 * breaking the request — this is a single-instance Redis container, not a
 * highly-available cluster, and caching is a speedup, not a correctness
 * requirement.
 */
@Configuration
@EnableCaching
public class CacheConfig implements CachingConfigurer {

    private static final Logger log = LoggerFactory.getLogger(CacheConfig.class);
    private static final Duration REFERENCE_DATA_TTL = Duration.ofMinutes(30);

    @Bean
    public RedisCacheManagerBuilderCustomizer referenceDataCacheCustomizer() {
        return builder -> builder
            .withCacheConfiguration("interestCatalog", typedCacheConfig(InterestCatalogResponse.class))
            .withCacheConfiguration("colleges", typedCacheConfig(
                TypeFactory.createDefaultInstance().constructCollectionType(List.class, CollegeResponse.class)))
            .withCacheConfiguration("collegeByDomain", typedCacheConfig(College.class));
    }

    private static RedisCacheConfiguration typedCacheConfig(Class<?> valueType) {
        return RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(REFERENCE_DATA_TTL)
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new JacksonJsonRedisSerializer<>(valueType)));
    }

    private static RedisCacheConfiguration typedCacheConfig(tools.jackson.databind.JavaType valueType) {
        return RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(REFERENCE_DATA_TTL)
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new JacksonJsonRedisSerializer<>(valueType)));
    }

    /**
     * {@code @EnableCaching} only picks up a custom {@link CacheErrorHandler} when
     * it's returned from {@link CachingConfigurer} — a standalone {@code @Bean} of
     * this type is silently ignored, which would otherwise leave cache failures
     * uncaught despite this class existing.
     */
    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Cache get failed for {} key={}; falling through to the source", cache.getName(), key, exception);
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                log.warn("Cache put failed for {} key={}", cache.getName(), key, exception);
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Cache evict failed for {} key={}", cache.getName(), key, exception);
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                log.warn("Cache clear failed for {}", cache.getName(), exception);
            }
        };
    }
}
