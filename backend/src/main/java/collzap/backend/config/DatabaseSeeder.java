package collzap.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import collzap.backend.enums.AdminRole;
import collzap.backend.enums.InterestCategory;
import collzap.backend.models.AdminUser;
import collzap.backend.models.College;
import collzap.backend.models.Interest;
import collzap.backend.repositories.AdminUserRepository;
import collzap.backend.repositories.CollegeRepository;
import collzap.backend.repositories.InterestRepository;
import collzap.backend.repositories.SeriousnessTestQuestionRepository;
import collzap.backend.models.SeriousnessTestQuestion;

import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final AdminUserRepository adminUserRepository;
    private final CollegeRepository collegeRepository;
    private final InterestRepository interestRepository;
    private final SeriousnessTestQuestionRepository questionRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(
            AdminUserRepository adminUserRepository,
            CollegeRepository collegeRepository,
            InterestRepository interestRepository,
            SeriousnessTestQuestionRepository questionRepository,
            PasswordEncoder passwordEncoder) {
        this.adminUserRepository = adminUserRepository;
        this.collegeRepository = collegeRepository;
        this.interestRepository = interestRepository;
        this.questionRepository = questionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedAdmin();
        seedColleges();
        seedInterests();
        seedQuestions();
    }

    private void seedAdmin() {
        if (adminUserRepository.count() == 0) {
            AdminUser admin = new AdminUser(
                    "admin",
                    passwordEncoder.encode("admin"),
                    AdminRole.ADMIN
            );
            adminUserRepository.save(admin);
            System.out.println("Seeded default admin user (admin / admin)");
        }
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
                System.out.println("Seeded college: " + c.getEmailDomain());
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
            System.out.println("Seeded default interests");
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
            System.out.println("Seeded 25 dummy questions for each long-term interest");
        }
    }
}
