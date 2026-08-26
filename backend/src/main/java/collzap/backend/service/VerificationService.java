package collzap.backend.service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import collzap.backend.dto.CollegeDtos.ReviewDocumentRequest;
import collzap.backend.dto.CollegeDtos.UploadDocumentRequest;
import collzap.backend.dto.CollegeDtos.VerificationDocumentResponse;
import collzap.backend.dto.CollegeDtos.VerificationStatusResponse;
import collzap.backend.enums.DocumentStatus;
import collzap.backend.enums.NotificationType;
import collzap.backend.enums.VerificationStatus;
import collzap.backend.exception.ConflictException;
import collzap.backend.exception.NotFoundException;
import collzap.backend.models.AdminUser;
import collzap.backend.models.User;
import collzap.backend.models.VerificationDocument;
import collzap.backend.repositories.UserRepository;
import collzap.backend.repositories.VerificationDocumentRepository;

/**
 * College verification: the user posts the URL of a fee slip or ID card they
 * uploaded to storage, an admin looks at it, and the decision flips the user's
 * verification status.
 */
@Service
public class VerificationService {

    private final VerificationDocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final EmailService emailService;
    private final NotificationService notificationService;

    public VerificationService(
        VerificationDocumentRepository documentRepository,
        UserRepository userRepository,
        UserService userService,
        EmailService emailService,
        NotificationService notificationService
    ) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public VerificationStatusResponse status(UUID userId) {
        User user = userService.require(userId);
        List<VerificationDocumentResponse> documents = documentRepository
            .findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(VerificationService::toResponse)
            .toList();
        return new VerificationStatusResponse(
            user.getVerificationStatus(),
            messageFor(user),
            canUpload(user.getVerificationStatus()),
            documents
        );
    }

    @Transactional
    public VerificationDocumentResponse upload(UUID userId, UploadDocumentRequest request) {
        User user = userService.require(userId);
        if (!canUpload(user.getVerificationStatus())) {
            throw new ConflictException(
                user.getVerificationStatus() == VerificationStatus.APPROVED
                    ? "You are already verified"
                    : "A document is already waiting for review");
        }

        VerificationDocument document = documentRepository.save(new VerificationDocument(
            user,
            request.documentType(),
            request.documentUrl().trim()
        ));

        user.setVerificationStatus(VerificationStatus.DOCUMENT_SUBMITTED);
        user.setRejectionReason(null);
        userRepository.save(user);

        return toResponse(document);
    }

    /**
     * Admin decision. Approving lifts the user to APPROVED; rejecting sends them
     * back so they can upload a clearer document.
     */
    @Transactional
    public VerificationDocumentResponse review(UUID documentId, ReviewDocumentRequest request, AdminUser reviewer) {
        VerificationDocument document = documentRepository.findWithUserById(documentId)
            .orElseThrow(() -> new NotFoundException("Document not found"));
        if (document.getStatus() != DocumentStatus.PENDING) {
            throw new ConflictException("That document has already been reviewed");
        }

        boolean approve = Boolean.TRUE.equals(request.approve());
        String note = UserService.trimToNull(request.note());
        Instant now = Instant.now();

        document.setStatus(approve ? DocumentStatus.APPROVED : DocumentStatus.REJECTED);
        document.setReviewedBy(reviewer);
        document.setReviewedAt(now);
        document.setReviewNote(note);
        documentRepository.save(document);

        User user = document.getUser();
        if (approve) {
            user.setVerificationStatus(VerificationStatus.APPROVED);
            user.setRejectionReason(null);
        } else {
            user.setVerificationStatus(VerificationStatus.REJECTED);
            user.setRejectionReason(note == null ? "The document could not be verified." : note);
        }
        userRepository.save(user);

        if (approve) {
            emailService.sendVerificationApproved(user.getEmail(), user.getName());
            notificationService.notifyUser(
                user,
                NotificationType.VERIFICATION_APPROVED,
                "You are verified",
                "Your college verification was approved. Time to find your peers.",
                Map.of("documentId", document.getId().toString())
            );
        } else {
            emailService.sendVerificationRejected(user.getEmail(), user.getName(), user.getRejectionReason());
            notificationService.notifyUser(
                user,
                NotificationType.VERIFICATION_REJECTED,
                "Verification needs another try",
                user.getRejectionReason(),
                Map.of("documentId", document.getId().toString())
            );
        }
        return toResponse(document);
    }

    /**
     * A rejected user may upload again; a submitted one must wait. This is also
     * what the client uses to decide whether to show the upload button.
     */
    private static boolean canUpload(VerificationStatus status) {
        return status == VerificationStatus.PENDING || status == VerificationStatus.REJECTED;
    }

    private static String messageFor(User user) {
        return switch (user.getVerificationStatus()) {
            case PENDING -> "Upload your fee slip or college ID card so we can verify you.";
            case DOCUMENT_SUBMITTED -> "We are reviewing your document. This usually takes a few hours.";
            case APPROVED -> "You are verified.";
            case REJECTED -> user.getRejectionReason() == null
                ? "We could not verify that document. Please upload a clearer one."
                : user.getRejectionReason();
        };
    }

    public static VerificationDocumentResponse toResponse(VerificationDocument document) {
        return new VerificationDocumentResponse(
            document.getId(),
            document.getDocumentType(),
            document.getDocumentUrl(),
            document.getStatus(),
            document.getReviewNote(),
            document.getCreatedAt(),
            document.getReviewedAt()
        );
    }
}
