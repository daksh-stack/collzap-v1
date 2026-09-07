package collzap.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Refuses to boot under the {@code prod} profile with development-only or
 * weak settings still in place — a wrong env var is a much better failure
 * than a production deployment silently signing tokens with a secret checked
 * into git, or reusing whatever short value someone typed into a .env by
 * hand. Runs before {@link DatabaseSeeder} so a bad config never touches the
 * database.
 *
 * <p>{@code collzap.jwt.secret} itself has no default in application.properties
 * (it's a required {@code ${JWT_SECRET}} placeholder), so Spring already
 * refuses to start at all if it's unset anywhere, dev or prod — the checks
 * here catch a value that resolves to *something*, just not something safe.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ProductionSafetyChecks implements CommandLineRunner {

    private static final String KNOWN_PLACEHOLDER_JWT_SECRET =
        "collzap-development-only-secret-change-me-in-production-32chars";
    private static final int MIN_JWT_SECRET_LENGTH = 32;

    private final CollzapProperties properties;
    private final Environment environment;

    public ProductionSafetyChecks(CollzapProperties properties, Environment environment) {
        this.properties = properties;
        this.environment = environment;
    }

    @Override
    public void run(String... args) {
        if (!environment.matchesProfiles("prod")) {
            return;
        }
        String jwtSecret = properties.getJwt().getSecret();
        if (KNOWN_PLACEHOLDER_JWT_SECRET.equals(jwtSecret)) {
            throw new IllegalStateException(
                "Refusing to start with the prod profile active and the known placeholder JWT "
                    + "secret. Set JWT_SECRET to a real, private value.");
        }
        if (jwtSecret == null || jwtSecret.length() < MIN_JWT_SECRET_LENGTH) {
            throw new IllegalStateException(
                "Refusing to start with the prod profile active and a JWT_SECRET shorter than "
                    + MIN_JWT_SECRET_LENGTH + " characters.");
        }
        if (properties.getAdmin().isSeedDemoData()) {
            throw new IllegalStateException(
                "Refusing to start with the prod profile active and collzap.admin.seed-demo-data "
                    + "still enabled. Set SEED_DEMO_DATA=false.");
        }
    }
}
