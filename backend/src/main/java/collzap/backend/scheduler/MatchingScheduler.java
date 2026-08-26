package collzap.backend.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import collzap.backend.service.MatchingService;

/**
 * The background half of matching. A user who is queued does not have to poll: this
 * sweep re-runs the pairing rules on every waiting bucket, so two people who joined
 * separate queues seconds apart end up in the same group without either of them
 * touching the app again.
 *
 * <p>Cadence comes from {@code collzap.matching.sweep-interval}, 30 seconds by
 * default, matching the spec's "auto-check every 30 seconds". It is a fixed delay
 * rather than a fixed rate so a slow pass cannot overlap the next one.
 */
@Component
public class MatchingScheduler {

    private static final Logger log = LoggerFactory.getLogger(MatchingScheduler.class);

    private final MatchingService matchingService;

    public MatchingScheduler(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @Scheduled(
        fixedDelayString = "${collzap.matching.sweep-interval:30s}",
        initialDelayString = "${collzap.matching.sweep-interval:30s}"
    )
    public void sweep() {
        try {
            int merged = matchingService.sweepWaitingQueue();
            if (merged > 0) {
                log.info("Matching sweep merged {} waiting group(s)", merged);
            }
        } catch (RuntimeException ex) {
            // Swallowed on purpose: an exception escaping a scheduled method cancels
            // the whole schedule, and one bad pass must not stop matching for good.
            log.error("Matching sweep failed; will retry on the next tick", ex);
        }
    }
}
