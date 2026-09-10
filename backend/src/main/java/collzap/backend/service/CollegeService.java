package collzap.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import collzap.backend.dto.CollegeDtos.CollegeResponse;
import collzap.backend.dto.CollegeDtos.CreateCollegeRequest;
import collzap.backend.exception.BadRequestException;
import collzap.backend.exception.ConflictException;
import collzap.backend.exception.NotFoundException;
import collzap.backend.models.College;
import collzap.backend.repositories.CollegeRepository;

@Service
public class CollegeService {

    private final CollegeRepository collegeRepository;

    public CollegeService(CollegeRepository collegeRepository) {
        this.collegeRepository = collegeRepository;
    }

    @Cacheable("colleges")
    @Transactional(readOnly = true)
    public List<CollegeResponse> listAll() {
        return collegeRepository.findAll().stream()
            .filter(College::isActive)
            .sorted((a, b) -> a.getName().compareToIgnoreCase(b.getName()))
            .map(CollegeService::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public College getById(UUID id) {
        return collegeRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("College not found"));
    }

    /**
     * Resolves the college that owns an email address. This is the gate that keeps
     * signups to recognised college domains.
     */
    @Cacheable(value = "collegeByDomain", key = "#email.trim().toLowerCase()")
    @Transactional(readOnly = true)
    public College requireByEmail(String email) {
        String domain = extractDomain(email);
        return collegeRepository.findByEmailDomainIgnoreCase(domain)
            .filter(College::isActive)
            .orElseThrow(() -> new BadRequestException(
                "%s is not a recognised college email domain yet. Contact support to add your college."
                    .formatted(domain)));
    }

    @CacheEvict(value = {"colleges", "collegeByDomain"}, allEntries = true)
    @Transactional
    public CollegeResponse create(CreateCollegeRequest request) {
        String domain = normalizeDomain(request.emailDomain());
        if (collegeRepository.existsByEmailDomainIgnoreCase(domain)) {
            throw new ConflictException("A college with that email domain already exists");
        }
        if (collegeRepository.findByNameIgnoreCase(request.name().trim()).isPresent()) {
            throw new ConflictException("A college with that name already exists");
        }
        College college = new College(request.name().trim(), domain, trimToNull(request.city()));
        return toResponse(collegeRepository.save(college));
    }

    static String extractDomain(String email) {
        String normalized = OtpService.normalize(email);
        int at = normalized.lastIndexOf('@');
        if (at < 0 || at == normalized.length() - 1) {
            throw new BadRequestException("Enter a valid college email address");
        }
        return normalized.substring(at + 1);
    }

    private static String normalizeDomain(String domain) {
        String normalized = OtpService.normalize(domain);
        if (normalized.startsWith("@")) {
            normalized = normalized.substring(1);
        }
        if (normalized.isBlank() || !normalized.contains(".")) {
            throw new BadRequestException("Enter a valid email domain, for example iitb.ac.in");
        }
        return normalized;
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    public static CollegeResponse toResponse(College college) {
        return new CollegeResponse(
            college.getId(),
            college.getName(),
            college.getEmailDomain(),
            college.getCity()
        );
    }
}
