package collzap.backend.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import collzap.backend.dto.CollegeApplicationDtos.CollegeApplicationAck;
import collzap.backend.dto.CollegeApplicationDtos.SubmitCollegeApplicationRequest;
import collzap.backend.ratelimit.RateLimited;
import collzap.backend.service.CollegeApplicationService;
import jakarta.validation.Valid;

/**
 * "Bring CollZap to my college" — the one place in the app a completely
 * anonymous visitor can submit something. Both routes are permitAll in
 * SecurityConfig and IP-rate-limited accordingly (there is no user id to key
 * on). See UploadController's javadoc for why this does not simply reuse
 * /api/upload.
 */
@RestController
@RequestMapping("/api/college-applications")
public class CollegeApplicationController {

    private final CollegeApplicationService applicationService;

    public CollegeApplicationController(CollegeApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @RateLimited(name = "college-application-upload", limit = 5, windowSeconds = 3600, keyType = RateLimited.KeyType.IP)
    @PostMapping(value = "/document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadDocument(@RequestParam("file") MultipartFile file) {
        String url = applicationService.uploadDocument(file);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @RateLimited(name = "college-application", limit = 3, windowSeconds = 3600, keyType = RateLimited.KeyType.IP)
    @PostMapping
    public ResponseEntity<CollegeApplicationAck> submit(@Valid @RequestBody SubmitCollegeApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.submit(request));
    }
}
