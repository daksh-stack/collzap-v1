package collzap.backend.service;

import java.io.IOException;
import java.io.InputStream;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import collzap.backend.exception.BadRequestException;

/**
 * The file-acceptance rules shared by every upload path in the app: profile
 * photos, verification documents, college-application documents, and daily
 * task submissions. Pulled out of {@code UploadController} so there is exactly
 * one definition per policy rather than several that can quietly drift apart.
 *
 * Two named policies exist because they genuinely differ: photos and
 * verification documents are always images (a fee slip or ID is photographed,
 * never scanned to PDF, in practice), while a task submission is often a
 * write-up or a code screenshot that may legitimately be a PDF, and the source
 * plan calls for a larger 10 MB ceiling there.
 */
@Service
public class DocumentUploadService {

    private static final Set<String> IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final Set<String> IMAGE_AND_PDF_TYPES = Set.of(
        "image/jpeg", "image/png", "image/webp", "application/pdf"
    );

    /** Photos and verification documents: images only, 5 MB. Unchanged from before this class supported policies. */
    public static final UploadPolicy IMAGE_5MB = new UploadPolicy(5 * 1024 * 1024, IMAGE_TYPES);

    /** Task submissions: images or a PDF write-up, 10 MB. */
    public static final UploadPolicy TASK_SUBMISSION_10MB = new UploadPolicy(10 * 1024 * 1024, IMAGE_AND_PDF_TYPES);

    private final CloudinaryService cloudinaryService;

    public DocumentUploadService(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    /** Convenience overload for every existing caller — same behaviour as before, under {@link #IMAGE_5MB}. */
    public String validateAndUpload(MultipartFile file, String folder) {
        return validateAndUpload(file, folder, IMAGE_5MB);
    }

    /**
     * Validates size, declared content type and actual file signature against
     * {@code policy}, then uploads to the given Cloudinary folder. Throws
     * {@link BadRequestException} (400) on any validation failure rather than
     * returning a sentinel, so every caller gets the same error shape for free
     * through the global handler.
     */
    public String validateAndUpload(MultipartFile file, String folder, UploadPolicy policy) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        if (file.getSize() > policy.maxSize()) {
            throw new BadRequestException("File must be smaller than " + (policy.maxSize() / (1024 * 1024)) + " MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !policy.allowedTypes().contains(contentType)) {
            throw new BadRequestException(policy.rejectionMessage());
        }
        // The Content-Type header is client-supplied, so also check the bytes.
        if (!hasValidSignature(file, policy)) {
            throw new BadRequestException(policy.rejectionMessage());
        }
        String resourceType = policy.allowedTypes().contains("application/pdf") ? "auto" : "image";
        return cloudinaryService.upload(file, folder, resourceType);
    }

    private static boolean hasValidSignature(MultipartFile file, UploadPolicy policy) {
        byte[] b = new byte[12];
        int n;
        try (InputStream in = file.getInputStream()) {
            n = in.readNBytes(b, 0, b.length);
        } catch (IOException e) {
            return false;
        }
        if (n < 4) return false;
        boolean jpeg = n >= 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF;
        boolean png = n >= 4 && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G';
        boolean webp = n >= 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
            && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P';
        boolean pdf = policy.allowedTypes().contains("application/pdf")
            && n >= 4 && b[0] == '%' && b[1] == 'P' && b[2] == 'D' && b[3] == 'F';
        return jpeg || png || webp || pdf;
    }

    public record UploadPolicy(long maxSize, Set<String> allowedTypes) {
        String rejectionMessage() {
            return allowedTypes.contains("application/pdf")
                ? "Only JPEG, PNG, WebP or PDF files are allowed"
                : "Only JPEG, PNG and WebP images are allowed";
        }
    }
}
