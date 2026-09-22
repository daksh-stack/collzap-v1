package collzap.backend.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import collzap.backend.service.TaskAssignmentService;

/**
 * Midnight IST, every day: advance every eligible group's daily-task clock by
 * one. {@code zone = "Asia/Kolkata"} is deliberate and required — nothing else
 * in this codebase does timezone-aware scheduling, so the JVM/container's
 * default zone must never be allowed to decide what day it is here.
 */
@Component
public class TaskAssignmentScheduler {

    private static final Logger log = LoggerFactory.getLogger(TaskAssignmentScheduler.class);

    private final TaskAssignmentService taskAssignmentService;

    public TaskAssignmentScheduler(TaskAssignmentService taskAssignmentService) {
        this.taskAssignmentService = taskAssignmentService;
    }

    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Kolkata")
    public void rollover() {
        try {
            var result = taskAssignmentService.runDailyRollover();
            log.info(result.summary());
        } catch (RuntimeException ex) {
            // Each group already isolates its own failure inside runDailyRollover();
            // this only catches something going wrong in the sweep itself (e.g. a
            // bad query), so the next scheduled tick still gets a chance to run.
            log.error("Daily task rollover sweep failed; will retry on the next scheduled run", ex);
        }
    }
}
