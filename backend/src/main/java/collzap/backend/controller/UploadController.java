package collzap.backend.controller;

import java.util.Map;
import java.util.Set;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import collzap.backend.security.AuthPrincipal;
import collzap.backend.service.CloudinaryService;

/**
 * General-purpose file upload endpoint. The client sends a file and a category
 * (DOCUMENT or PROFILE_PHOTO); the controller validates the file, uploads it
 * to Cloudinary, and returns the resulting URL.
 */
@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private static final Set<String> ALLOWED_TYPES = Set.of(
        "image/jpeg", "image/png", "image/webp"
    );
    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5 MB

    private static final Map<String, String> CATEGORY_FOLDERS = Map.of(
        "DOCUMENT", "collzap/documents",
        "PROFILE_PHOTO", "collzap/profile-photos"
    );

    private final CloudinaryService cloudinaryService;

    public UploadController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> upload(
        @AuthenticationPrincipal AuthPrincipal me,
        @RequestParam("file") MultipartFile file,
        @RequestParam("category") String category
    ) {
        // Validate category
        String folder = CATEGORY_FOLDERS.get(category.toUpperCase());
        if (folder == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Invalid category. Must be DOCUMENT or PROFILE_PHOTO"
            ));
        }

        // Validate file is not empty
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "File is empty"
            ));
        }

        // Validate file size
        if (file.getSize() > MAX_SIZE) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "File must be smaller than 5 MB"
            ));
        }

        // Validate content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Only JPEG, PNG and WebP images are allowed"
            ));
        }

        String url = cloudinaryService.upload(file, folder);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
