package collzap.backend.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import collzap.backend.config.CollzapProperties;

/**
 * Uploads files to Cloudinary and returns the secure URL. Each upload category
 * maps to a distinct Cloudinary folder so documents and profile photos stay
 * organised.
 */
@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(CollzapProperties properties) {
        CollzapProperties.Cloudinary cfg = properties.getCloudinary();
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
            "cloud_name", cfg.getCloudName(),
            "api_key", cfg.getApiKey(),
            "api_secret", cfg.getApiSecret(),
            "secure", true
        ));
    }

    /**
     * Uploads the given file to the specified Cloudinary folder.
     *
     * @param file   the multipart file to upload
     * @param folder the Cloudinary folder path (e.g. "collzap/documents")
     * @return the secure URL of the uploaded asset
     */
    @SuppressWarnings("unchecked")
    public String upload(MultipartFile file, String folder) {
        try {
            Map<String, Object> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "image"
                )
            );
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to Cloudinary", e);
        }
    }
}
