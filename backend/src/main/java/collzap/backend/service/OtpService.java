package collzap.backend.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import collzap.backend.config.CollzapProperties;
import collzap.backend.enums.OtpPurpose;
import collzap.backend.exception.BadRequestException;
import collzap.backend.models.OtpCode;
import collzap.backend.repositories.OtpCodeRepository;

/**
 * Issues and checks the email OTPs. Codes are stored as an HMAC rather than in
 * the clear; brute-force resistance comes from the short TTL plus the per-code
 * attempt cap, not from the hash cost.
 */
@Service
public class OtpService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";

    private final OtpCodeRepository otpCodeRepository;
    private final EmailService emailService;
    private final CollzapProperties properties;
    private final SecureRandom random = new SecureRandom();

    public OtpService(
        OtpCodeRepository otpCodeRepository,
        EmailService emailService,
        CollzapProperties properties
    ) {
        this.otpCodeRepository = otpCodeRepository;
        this.emailService = emailService;
        this.properties = properties;
    }

    /** @return seconds until the issued code expires */
    @Transactional
    public long issue(String email, OtpPurpose purpose) {
        String normalized = normalize(email);
        var otpConfig = properties.getOtp();
        Instant now = Instant.now();

        long recent = otpCodeRepository.countByEmailIgnoreCaseAndCreatedAtAfter(
            normalized,
            now.minus(otpConfig.getRateLimitWindow())
        );
        if (recent >= otpConfig.getMaxPerWindow()) {
            throw new BadRequestException(
                "Too many codes requested for this email. Try again later.");
        }

        // A fresh code supersedes anything still outstanding for this address.
        otpCodeRepository.consumeAllForEmail(normalized, now);

        String code = generateCode(otpConfig.getLength());
        OtpCode entity = new OtpCode(
            normalized,
            hash(code),
            purpose,
            now.plus(otpConfig.getTtl())
        );
        otpCodeRepository.save(entity);

        emailService.sendOtp(normalized, code, otpConfig.getTtl());
        if (properties.getMail().isLogCodes()) {
            org.slf4j.LoggerFactory.getLogger(OtpService.class)
                .info("OTP for {} is {}", normalized, code);
        }
        return otpConfig.getTtl().toSeconds();
    }

    /**
     * Consumes the outstanding code for the address.
     *
     * @throws BadRequestException when there is no live code, it expired, the
     *                            attempt cap was hit, or the digits do not match
     */
    @Transactional
    public void verify(String email, String code, OtpPurpose purpose) {
        String normalized = normalize(email);
        Instant now = Instant.now();

        List<OtpCode> candidates = otpCodeRepository
            .findByEmailIgnoreCaseAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(normalized, purpose);
        if (candidates.isEmpty()) {
            throw new BadRequestException("Request a new code — this one is no longer valid.");
        }

        OtpCode current = candidates.getFirst();
        if (!current.isUsable(now)) {
            throw new BadRequestException("That code has expired. Request a new one.");
        }
        if (current.getAttempts() >= properties.getOtp().getMaxAttempts()) {
            current.setConsumedAt(now);
            otpCodeRepository.save(current);
            throw new BadRequestException("Too many wrong attempts. Request a new code.");
        }
        if (!constantTimeEquals(current.getCodeHash(), hash(code))) {
            current.setAttempts(current.getAttempts() + 1);
            otpCodeRepository.save(current);
            throw new BadRequestException("That code is not right. Check it and try again.");
        }

        current.setConsumedAt(now);
        otpCodeRepository.save(current);
    }

    private String generateCode(int length) {
        StringBuilder builder = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            builder.append(random.nextInt(10));
        }
        return builder.toString();
    }

    private String hash(String code) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(
                properties.getJwt().getSecret().getBytes(StandardCharsets.UTF_8),
                HMAC_ALGORITHM
            ));
            return HexFormat.of().formatHex(mac.doFinal(code.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException | java.security.InvalidKeyException ex) {
            throw new IllegalStateException("Unable to hash OTP code", ex);
        }
    }

    private static boolean constantTimeEquals(String a, String b) {
        return MessageDigest.isEqual(
            a.getBytes(StandardCharsets.UTF_8),
            b.getBytes(StandardCharsets.UTF_8)
        );
    }

    static String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
