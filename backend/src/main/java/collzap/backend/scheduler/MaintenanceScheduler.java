package collzap.backend.scheduler;

import java.time.Duration;
import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import collzap.backend.repositories.OtpCodeRepository;

/**
 * Housekeeping that has to happen whether or not anyone is using the app.
 */
@Component
public class MaintenanceScheduler {

    private static final Logger log = LoggerFactory.getLogger(MaintenanceScheduler.class);

    /** OTPs are short-lived; a day of slack is plenty for support to inspect one. */
    private static final Duration OTP_RETENTION = Duration.ofDays(1);

    private final OtpCodeRepository otpCodeRepository;

    public MaintenanceScheduler(OtpCodeRepository otpCodeRepository) {
        this.otpCodeRepository = otpCodeRepository;
    }

    /** Drops spent and expired one-time codes. */
    @Scheduled(cron = "0 17 * * * *")
    @Transactional
    public void purgeExpiredOtps() {
        try {
            int deleted = otpCodeRepository.deleteExpired(Instant.now().minus(OTP_RETENTION));
            if (deleted > 0) {
                log.info("Purged {} expired OTP row(s)", deleted);
            }
        } catch (RuntimeException ex) {
            log.error("OTP purge failed; will retry on the next run", ex);
        }
    }
}
