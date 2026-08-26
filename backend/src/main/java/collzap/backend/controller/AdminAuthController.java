package collzap.backend.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import collzap.backend.dto.AuthDtos.AdminAuthResponse;
import collzap.backend.dto.AuthDtos.AdminLoginRequest;
import collzap.backend.service.AuthService;
import jakarta.validation.Valid;

/**
 * The password gate in front of {@code /admin}. Operators are a separate identity
 * from users: their token carries ROLE_ADMIN and no user id, so an admin token can
 * never be used to act as a member.
 */
@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private final AuthService authService;

    public AdminAuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AdminAuthResponse login(@Valid @RequestBody AdminLoginRequest request) {
        return authService.adminLogin(request);
    }
}
