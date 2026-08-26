package collzap.backend.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import collzap.backend.dto.InterestDtos.ProjectTypesResponse;
import collzap.backend.dto.InterestDtos.SelectConnectionTypeRequest;
import collzap.backend.dto.InterestDtos.SelectProjectTypesRequest;
import collzap.backend.dto.UserDtos.ConnectionTypeSelectionResponse;
import collzap.backend.security.AuthPrincipal;
import collzap.backend.service.InterestService;
import jakarta.validation.Valid;

/**
 * Project type (Long-Term Peer and/or Short-Term Buddy) and connection type
 * (1-on-1, Short Group, Society). Both are stored choices a user can revisit,
 * which is why each is a PUT of the whole selection rather than a one-shot step.
 *
 * <p>Connection type is recorded per project type and applies to every interest
 * under it, matching the spec's "same type applies to all interests".
 */
@RestController
@RequestMapping("/api")
public class SelectionController {

    private final InterestService interestService;

    public SelectionController(InterestService interestService) {
        this.interestService = interestService;
    }

    @GetMapping("/project-types")
    public ProjectTypesResponse projectTypes(@AuthenticationPrincipal AuthPrincipal me) {
        return interestService.projectTypes(me.userId());
    }

    /** Both types may be chosen at once; the set replaces whatever was there. */
    @PutMapping("/project-types")
    public ProjectTypesResponse selectProjectTypes(
        @AuthenticationPrincipal AuthPrincipal me,
        @Valid @RequestBody SelectProjectTypesRequest request
    ) {
        return interestService.selectProjectTypes(me.userId(), request);
    }

    @GetMapping("/connection-types")
    public List<ConnectionTypeSelectionResponse> connectionTypes(
        @AuthenticationPrincipal AuthPrincipal me
    ) {
        return interestService.connectionTypes(me.userId());
    }

    /** Society is Long-Term only; the service rejects the invalid pairing. */
    @PutMapping("/connection-types")
    public ConnectionTypeSelectionResponse selectConnectionType(
        @AuthenticationPrincipal AuthPrincipal me,
        @Valid @RequestBody SelectConnectionTypeRequest request
    ) {
        return interestService.selectConnectionType(me.userId(), request);
    }
}
