package collzap.backend.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.client.RestClient;

/**
 * Cross-cutting switches: bound properties, the matching sweeper's scheduler and
 * async execution for notification fan-out.
 */
@Configuration
@EnableConfigurationProperties(CollzapProperties.class)
@EnableScheduling
@EnableAsync
public class AppConfig {

    @Bean
    public RestClient.Builder restClientBuilder() {
        return RestClient.builder();
    }

    /**
     * Without this bean, every {@code @Scheduled} job in the app — the 30-second
     * matching sweep, the hourly OTP purge, and the once-a-day task rollover —
     * shares Spring's single default scheduling thread. That was fine when the
     * only jobs were quick ones; the daily task rollover walks every active
     * match group across every interest with a task bank, and a slow tick could
     * delay the matching sweep (or the reverse) with no bean like this one.
     */
    @Bean
    public ThreadPoolTaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(2);
        scheduler.setThreadNamePrefix("collzap-scheduler-");
        return scheduler;
    }
}

