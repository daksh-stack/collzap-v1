package collzap.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import collzap.backend.dto.CollegeDtos.UploadDocumentRequest;
import collzap.backend.dto.CollegeDtos.VerificationDocumentResponse;
import collzap.backend.dto.CollegeDtos.VerificationStatusResponse;
import collzap.backend.security.AuthPrincipal;
import collzap.backend.service.VerificationService;
import jakarta.validation.Valid;

/**
 * College verification. A pending user can reach every setup screen — only
 * matching is gated — so this endpoint reports state rather than blocking, and
 * the client renders the clock icon on the match tab from {@code status}.
 */
@RestController
@RequestMapping("/api/verification")
public class VerificationController {

    private final VerificationService verificationService;

    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    /** Current state plus every document submitted so far, newest first. */
    @GetMapping
    public VerificationStatusResponse status(@AuthenticationPrincipal AuthPrincipal me) {
        return verificationService.status(me.userId());
    }

    /**
     * Records a fee slip or ID card for manual review. The client uploads the file
     * to storage itself and posts the resulting URL.
     */
    @PostMapping("/documents")
    public ResponseEntity<VerificationDocumentResponse> upload(
        @AuthenticationPrincipal AuthPrincipal me,
        @Valid @RequestBody UploadDocumentRequest request
    ) {
        VerificationDocumentResponse response = verificationService.upload(me.userId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
