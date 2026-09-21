package collzap.backend.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import collzap.backend.dto.CollegeApplicationDtos.AdminCollegeApplicationRow;
import collzap.backend.dto.CollegeApplicationDtos.CollegeApplicationAck;
import collzap.backend.dto.CollegeApplicationDtos.SubmitCollegeApplicationRequest;
import collzap.backend.dto.CollegeDtos.ReviewDocumentRequest;
import collzap.backend.dto.CommonDtos.PageResponse;
import collzap.backend.enums.DocumentStatus;
import collzap.backend.exception.ConflictException;
import collzap.backend.exception.NotFoundException;
import collzap.backend.models.AdminUser;
import collzap.backend.models.CollegeApplication;
import collzap.backend.repositories.CollegeApplicationRepository;

/**
 * "Bring CollZap to my college" applications. Unlike VerificationDocument this
 * has no User and no College row to attach to — the whole premise is that the
 * applicant's college isn't onboarded yet, so everything about them and it is
 * captured as free text. Approving an application does not create a User, a
 * College, or send an email; it only records a decision for an admin to act on.
 */
@Service
public class CollegeApplicationService {

    private static final String DOCUMENT_FOLDER = "collzap/college-applications";

    private final CollegeApplicationRepository repository;
    private final DocumentUploadService documentUploadService;

    public CollegeApplicationService(
        CollegeApplicationRepository repository,
        DocumentUploadService documentUploadService
    ) {
        this.repository = repository;
        this.documentUploadService = documentUploadService;
    }

    /** The public upload step. Same validation as every other upload path, fixed folder. */
    public String uploadDocument(MultipartFile file) {
        return documentUploadService.validateAndUpload(file, DOCUMENT_FOLDER);
    }

    @Transactional
    public CollegeApplicationAck submit(SubmitCollegeApplicationRequest request) {
        String email = request.email().trim().toLowerCase();

        // One open application per email at a time — not a hard uniqueness
        // constraint, since a rejected applicant should be free to reapply
        // (e.g. with a clearer photo) without contacting support first.
        if (repository.existsByEmailIgnoreCaseAndStatus(email, DocumentStatus.PENDING)) {
            throw new ConflictException(
                "You already have an application under review. We'll be in touch soon.");
        }

        CollegeApplication application = new CollegeApplication(
            request.fullName().trim(),
            email,
            request.contactNumber().trim(),
            request.collegeName().trim(),
            UserService.trimToNull(request.collegeCity()),
            request.motivation().trim(),
            request.documentType(),
            request.documentUrl().trim()
        );
        application = repository.save(application);

        return new CollegeApplicationAck(
            application.getId(),
            "Thanks — we've got your application. We'll reach out at " + email + " once it's reviewed."
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminCollegeApplicationRow> list(DocumentStatus status, Pageable pageable) {
        Page<CollegeApplication> page = repository.findAllByOptionalStatus(status, pageable);
        return PageResponse.from(page, CollegeApplicationService::toRow);
    }

    @Transactional
    public AdminCollegeApplicationRow review(UUID id, ReviewDocumentRequest request, AdminUser reviewer) {
        CollegeApplication application = repository.findWithReviewerById(id)
            .orElseThrow(() -> new NotFoundException("Application not found"));
        if (application.getStatus() != DocumentStatus.PENDING) {
            throw new ConflictException("That application has already been reviewed");
        }

        boolean approve = Boolean.TRUE.equals(request.approve());
        application.setStatus(approve ? DocumentStatus.APPROVED : DocumentStatus.REJECTED);
        application.setReviewedBy(reviewer);
        application.setReviewedAt(Instant.now());
        application.setReviewNote(UserService.trimToNull(request.note()));
        return toRow(repository.save(application));
    }

    private static AdminCollegeApplicationRow toRow(CollegeApplication a) {
        return new AdminCollegeApplicationRow(
            a.getId(),
            a.getFullName(),
            a.getEmail(),
            a.getContactNumber(),
            a.getCollegeName(),
            a.getCollegeCity(),
            a.getMotivation(),
            a.getDocumentType(),
            a.getDocumentUrl(),
            a.getStatus(),
            a.getReviewNote(),
            a.getReviewedBy() == null ? null : a.getReviewedBy().getUsername(),
            a.getReviewedAt(),
            a.getCreatedAt()
        );
    }
}
