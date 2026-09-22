package collzap.backend.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import collzap.backend.dto.TaskDtos.UserTaskStatsResponse;
import collzap.backend.security.AuthPrincipal;
import collzap.backend.service.TaskSubmissionService;

/** Points and streak, across every group and interest the caller is in. */
@RestController
@RequestMapping("/api/me/task-stats")
public class UserTaskStatsController {

    private final TaskSubmissionService taskSubmissionService;

    public UserTaskStatsController(TaskSubmissionService taskSubmissionService) {
        this.taskSubmissionService = taskSubmissionService;
    }

    @GetMapping
    public UserTaskStatsResponse myStats(@AuthenticationPrincipal AuthPrincipal me) {
        return taskSubmissionService.myStats(me.userId());
    }
}
