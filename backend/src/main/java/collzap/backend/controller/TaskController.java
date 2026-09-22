package collzap.backend.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import collzap.backend.dto.TaskDtos.ReviewResponse;
import collzap.backend.dto.TaskDtos.ReviewSubmissionRequest;
import collzap.backend.dto.TaskDtos.SubmissionResponse;
import collzap.backend.dto.TaskDtos.SubmitTaskRequest;
import collzap.backend.dto.TaskDtos.TodaysTaskResponse;
import collzap.backend.ratelimit.RateLimited;
import collzap.backend.security.AuthPrincipal;
import collzap.backend.service.TaskSubmissionService;
import jakarta.validation.Valid;

/**
 * Daily tasks, scoped under the match group they belong to — the same
 * "you must be an active member of this group" check every other group-scoped
 * action already uses gates every route here (see
 * {@link collzap.backend.service.TaskAssignmentService#requireActiveMember}).
 */
@RestController
@RequestMapping("/api/matches/{groupId}/tasks")
public class TaskController {

    private final TaskSubmissionService taskSubmissionService;

    public TaskController(TaskSubmissionService taskSubmissionService) {
        this.taskSubmissionService = taskSubmissionService;
    }

    @GetMapping("/today")
    public TodaysTaskResponse today(@AuthenticationPrincipal AuthPrincipal me, @PathVariable UUID groupId) {
        return taskSubmissionService.todaysTask(groupId, me.userId());
    }

    @RateLimited(name = "task-submission", limit = 30, windowSeconds = 3600)
    @PostMapping("/{assignmentId}/submissions")
    public ResponseEntity<SubmissionResponse> submit(
        @AuthenticationPrincipal AuthPrincipal me,
        @PathVariable UUID groupId,
        @PathVariable UUID assignmentId,
        @Valid @RequestBody SubmitTaskRequest request
    ) {
        SubmissionResponse response = taskSubmissionService.submit(groupId, assignmentId, me.userId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @RateLimited(name = "task-review", limit = 60, windowSeconds = 3600)
    @PostMapping("/submissions/{submissionId}/reviews")
    public ResponseEntity<ReviewResponse> review(
        @AuthenticationPrincipal AuthPrincipal me,
        @PathVariable UUID groupId,
        @PathVariable UUID submissionId,
        @Valid @RequestBody ReviewSubmissionRequest request
    ) {
        ReviewResponse response = taskSubmissionService.review(groupId, submissionId, me.userId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
