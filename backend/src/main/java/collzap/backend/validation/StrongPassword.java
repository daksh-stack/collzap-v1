package collzap.backend.validation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

/**
 * Rejects passwords that pass a length check but are trivially guessable:
 * common-password list entries, one repeated character, or a plain run like
 * 12345678. Null is left to @NotBlank.
 */
@Documented
@Constraint(validatedBy = StrongPasswordValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT })
@Retention(RetentionPolicy.RUNTIME)
public @interface StrongPassword {

    String message() default "That password is too easy to guess. Choose something less common.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
