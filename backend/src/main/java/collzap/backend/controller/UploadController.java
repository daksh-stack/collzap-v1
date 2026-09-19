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

import collzap.backend.ratelimit.RateLimited;
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

    @RateLimited(name = "file-upload", limit = 20, windowSeconds = 3600)
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

        // The Content-Type header is client-supplied, so also check the bytes.
        if (!hasImageSignature(file)) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "That file is not a valid JPEG, PNG or WebP image"
            ));
        }

        String url = cloudinaryService.upload(file, folder);
        return ResponseEntity.ok(Map.of("url", url));
    }

    private static boolean hasImageSignature(MultipartFile file) {
        byte[] b = new byte[12];
        int n;
        try (java.io.InputStream in = file.getInputStream()) {
            n = in.readNBytes(b, 0, b.length);
        } catch (java.io.IOException e) {
            return false;
        }
        if (n < 12) return false;
        boolean jpeg = (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF;
        boolean png = (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G';
        boolean webp = b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
            && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P';
        return jpeg || png || webp;
    }
}
