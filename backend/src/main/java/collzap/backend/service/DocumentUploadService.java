package collzap.backend.service;

import java.io.IOException;
import java.io.InputStream;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import collzap.backend.exception.BadRequestException;

/**
 * The file-acceptance rules shared by every upload path in the app: profile
 * photos, verification documents, and college-application documents. Pulled
 * out of {@code UploadController} so there is exactly one definition of "what
 * counts as an acceptable image" rather than two that can quietly drift apart.
 */
@Service
public class DocumentUploadService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
        "image/jpeg", "image/png", "image/webp"
    );
    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5 MB

    private final CloudinaryService cloudinaryService;

    public DocumentUploadService(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    /**
     * Validates size, declared content type and actual file signature, then
     * uploads to the given Cloudinary folder. Throws {@link BadRequestException}
     * (400) on any validation failure rather than returning a sentinel, so every
     * caller gets the same error shape for free through the global handler.
     */
    public String validateAndUpload(MultipartFile file, String folder) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new BadRequestException("File must be smaller than 5 MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BadRequestException("Only JPEG, PNG and WebP images are allowed");
        }
        // The Content-Type header is client-supplied, so also check the bytes.
        if (!hasImageSignature(file)) {
            throw new BadRequestException("That file is not a valid JPEG, PNG or WebP image");
        }
        return cloudinaryService.upload(file, folder);
    }

    private static boolean hasImageSignature(MultipartFile file) {
        byte[] b = new byte[12];
        int n;
        try (InputStream in = file.getInputStream()) {
            n = in.readNBytes(b, 0, b.length);
        } catch (IOException e) {
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
