package collzap.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import collzap.backend.dto.CommonDtos.MessageResponse;
import collzap.backend.dto.TaskBankDtos.TaskBankItemResponse;
import collzap.backend.dto.TaskBankDtos.TaskBankResponse;
import collzap.backend.dto.TaskBankDtos.UploadTaskBankRequest;
import collzap.backend.service.TaskAssignmentService;
import collzap.backend.service.TaskBankService;
import jakarta.validation.Valid;

/**
 * Admin management of daily task banks. {@code /run-now} exists purely so a
 * newly uploaded bank can be verified without waiting for the real
 * midnight-IST scheduler tick — it runs the exact same rollover the scheduler
 * does, not a separate code path.
 */
@RestController
@RequestMapping("/api/admin/task-banks")
public class AdminTaskBankController {

    private final TaskBankService taskBankService;
    private final TaskAssignmentService taskAssignmentService;

    public AdminTaskBankController(TaskBankService taskBankService, TaskAssignmentService taskAssignmentService) {
        this.taskBankService = taskBankService;
        this.taskAssignmentService = taskAssignmentService;
    }

    @GetMapping
    public List<TaskBankResponse> list(@RequestParam(required = false) UUID interestId) {
        return interestId == null ? taskBankService.listAll() : taskBankService.listForInterest(interestId);
    }

    @GetMapping("/{taskBankId}/items")
    public List<TaskBankItemResponse> items(@PathVariable UUID taskBankId) {
        return taskBankService.items(taskBankId);
    }

    @PostMapping
    public ResponseEntity<TaskBankResponse> upload(@Valid @RequestBody UploadTaskBankRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskBankService.upload(request));
    }

    @PostMapping("/{taskBankId}/deactivate")
    public MessageResponse deactivate(@PathVariable UUID taskBankId) {
        taskBankService.deactivate(taskBankId);
        return MessageResponse.of("Task bank deactivated");
    }

    @PostMapping("/run-now")
    public MessageResponse runNow() {
        return MessageResponse.of(taskAssignmentService.runDailyRollover().summary());
    }
}
