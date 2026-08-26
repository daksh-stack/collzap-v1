package collzap.backend.scheduler;

import java.time.Duration;
import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import collzap.backend.repositories.OtpCodeRepository;
import collzap.backend.service.SeriousnessTestService;

/**
 * Housekeeping that has to happen whether or not anyone is using the app.
 *
 * <p>The seriousness-test timer is silent, so nothing on the client enforces it. If
 * a sitting is abandoned mid-paper the deadline still has to land, which is what
 * makes this sweep part of the feature rather than mere tidying: it submits and
 * scores what was answered, exactly as an on-time submit would.
 */
@Component
public class MaintenanceScheduler {

    private static final Logger log = LoggerFactory.getLogger(MaintenanceScheduler.class);

    /** OTPs are short-lived; a day of slack is plenty for support to inspect one. */
    private static final Duration OTP_RETENTION = Duration.ofDays(1);

    private final SeriousnessTestService testService;
    private final OtpCodeRepository otpCodeRepository;

    public MaintenanceScheduler(
        SeriousnessTestService testService,
        OtpCodeRepository otpCodeRepository
    ) {
        this.testService = testService;
        this.otpCodeRepository = otpCodeRepository;
    }

    /** Auto-submits sittings whose silent timer has run out. */
    @Scheduled(fixedDelay = 60_000, initialDelay = 30_000)
    public void autoSubmitExpiredTests() {
        try {
            int submitted = testService.autoSubmitExpired();
            if (submitted > 0) {
                log.info("Auto-submitted {} expired test session(s)", submitted);
            }
        } catch (RuntimeException ex) {
            log.error("Auto-submit sweep failed; will retry on the next tick", ex);
        }
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
