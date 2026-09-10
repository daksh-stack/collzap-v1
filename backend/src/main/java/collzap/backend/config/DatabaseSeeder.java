package collzap.backend.config;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import collzap.backend.enums.AdminRole;
import collzap.backend.enums.InterestCategory;
import collzap.backend.models.AdminUser;
import collzap.backend.models.College;
import collzap.backend.models.Interest;
import collzap.backend.models.SeriousnessTestQuestion;
import collzap.backend.repositories.AdminUserRepository;
import collzap.backend.repositories.CollegeRepository;
import collzap.backend.repositories.InterestRepository;
import collzap.backend.repositories.SeriousnessTestQuestionRepository;

/**
 * First-boot setup: a bootstrap admin operator, and — only when
 * {@code collzap.admin.seed-demo-data} is enabled (the local-dev default) —
 * placeholder colleges/interests/questions so the app is usable without
 * manual data entry. That demo data must stay off in production, where a real
 * question bank and college list already exist or are entered deliberately
 * through the admin panel.
 */
@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final AdminUserRepository adminUserRepository;
    private final CollegeRepository collegeRepository;
    private final InterestRepository interestRepository;
    private final SeriousnessTestQuestionRepository questionRepository;
    private final PasswordEncoder passwordEncoder;
    private final CollzapProperties properties;

    public DatabaseSeeder(
            AdminUserRepository adminUserRepository,
            CollegeRepository collegeRepository,
            InterestRepository interestRepository,
            SeriousnessTestQuestionRepository questionRepository,
            PasswordEncoder passwordEncoder,
            CollzapProperties properties) {
        this.adminUserRepository = adminUserRepository;
        this.collegeRepository = collegeRepository;
        this.interestRepository = interestRepository;
        this.questionRepository = questionRepository;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedAdmin();
        if (properties.getAdmin().isSeedDemoData()) {
            seedColleges();
            seedInterests();
            seedQuestions();
        }
    }

    private void seedAdmin() {
        if (adminUserRepository.count() > 0) {
            return;
        }
        String username = properties.getAdmin().getBootstrapUsername();
        String configuredPassword = properties.getAdmin().getBootstrapPassword();
        String password = configuredPassword.isBlank() ? generatePassword() : configuredPassword;

        AdminUser admin = new AdminUser(username, passwordEncoder.encode(password), AdminRole.ADMIN);
        adminUserRepository.save(admin);

        if (configuredPassword.isBlank()) {
            log.warn(
                "No collzap.admin.bootstrap-password set — generated a one-time admin password.\n"
                    + "Username: {}\nPassword: {}\n"
                    + "This is logged only this once; save it now, then change it.",
                username, password
            );
        } else {
            log.info("Seeded bootstrap admin user '{}'", username);
        }
    }

    private static String generatePassword() {
        byte[] bytes = new byte[18];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private void seedColleges() {
        List<College> colleges = List.of(
            new College("Harvard University", "harvard.edu", "Cambridge"),
            new College("Stanford University", "stanford.edu", "Stanford"),
            new College("Massachusetts Institute of Technology", "mit.edu", "Cambridge"),
            new College("Indian Institute of Technology Bombay", "iitb.ac.in", "Mumbai"),
            new College("Chameli Devi Group of Institutions", "cdgi.edu.in", "Indore")
        );
        for (College c : colleges) {
            if (!collegeRepository.existsByEmailDomainIgnoreCase(c.getEmailDomain())) {
                collegeRepository.save(c);
                log.info("Seeded demo college: {}", c.getEmailDomain());
            }
        }
    }

    private void seedInterests() {
        if (interestRepository.count() == 0) {
            List<Interest> interests = List.of(
                new Interest("Machine Learning", InterestCategory.LONG_TERM, 1),
                new Interest("Web Development", InterestCategory.LONG_TERM, 2),
                new Interest("Blockchain", InterestCategory.LONG_TERM, 3),
                new Interest("Startup Building", InterestCategory.LONG_TERM, 4),
                new Interest("Hackathon", InterestCategory.SHORT_TERM, 1),
                new Interest("Exam Prep", InterestCategory.SHORT_TERM, 2),
                new Interest("Assignment Help", InterestCategory.SHORT_TERM, 3)
            );
            interestRepository.saveAll(interests);
            log.info("Seeded demo interests");
        }
    }

    private void seedQuestions() {
        if (questionRepository.count() == 0) {
            List<Interest> interests = interestRepository.findAll();
            for (Interest interest : interests) {
                if (interest.getCategory() == InterestCategory.LONG_TERM) {
                    for (int i = 1; i <= 25; i++) {
                        SeriousnessTestQuestion q = new SeriousnessTestQuestion(
                            interest,
                            "Dummy question " + i + " for " + interest.getName() + "?",
                            List.of("Option A", "Option B", "Option C", "Option D"),
                            0
                        );
                        questionRepository.save(q);
                    }
                }
            }
            log.info("Seeded 25 dummy questions for each long-term interest");
        }
    }
}
