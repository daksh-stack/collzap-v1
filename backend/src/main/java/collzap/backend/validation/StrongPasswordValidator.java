package collzap.backend.validation;

import java.util.Locale;
import java.util.Set;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {

    // Only entries of 8+ characters matter: shorter ones already fail @Size.
    private static final Set<String> COMMON = Set.of(
        "password", "password1", "password12", "password123", "password1234", "passw0rd", "p@ssw0rd",
        "p@ssword", "pass1234", "12345678", "123456789", "1234567890", "123123123", "12341234",
        "11111111", "00000000", "87654321", "987654321", "qwertyui", "qwerty12", "qwerty123",
        "qwertyuiop", "asdfghjk", "asdfghjkl", "zxcvbnm1", "1q2w3e4r", "1qaz2wsx", "abc12345",
        "abcd1234", "abcdefgh", "iloveyou", "iloveyou1", "letmein1", "welcome1", "welcome123",
        "admin123", "administrator", "changeme", "football", "baseball", "superman", "trustno1",
        "monkey123", "dragon123", "sunshine", "princess", "whatever", "starwars", "master123",
        "india123", "india@123", "indian123", "hello123", "hello1234", "test1234", "testtest",
        "user1234", "student123", "college123", "collzap", "collzap123", "collzap1", "12345678a",
        "a1234567", "aa123456", "1234abcd", "9876543210", "0123456789", "password@123", "pass@123",
        "welcome@123", "admin@123", "abcd@1234", "qwerty@123", "krishna123", "ganesh123", "shiva123"
    );

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }
        String p = value.toLowerCase(Locale.ROOT);
        if (COMMON.contains(p)) {
            return false;
        }
        return !isSingleRepeatedChar(p) && !isSequentialRun(p);
    }

    private static boolean isSingleRepeatedChar(String p) {
        return p.chars().distinct().count() == 1;
    }

    /** 12345678, 87654321, abcdefgh, hgfedcba — every step is +1 or -1. */
    private static boolean isSequentialRun(String p) {
        if (p.length() < 2) {
            return false;
        }
        int step = p.charAt(1) - p.charAt(0);
        if (step != 1 && step != -1) {
            return false;
        }
        for (int i = 1; i < p.length(); i++) {
            if (p.charAt(i) - p.charAt(i - 1) != step) {
                return false;
            }
        }
        return true;
    }
}
