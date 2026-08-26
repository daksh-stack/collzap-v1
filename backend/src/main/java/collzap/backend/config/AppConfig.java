package collzap.backend.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Cross-cutting switches: bound properties, the matching sweeper's scheduler and
 * async execution for notification fan-out.
 */
@Configuration
@EnableConfigurationProperties(CollzapProperties.class)
@EnableScheduling
@EnableAsync
public class AppConfig {
}
