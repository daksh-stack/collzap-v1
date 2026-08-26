package collzap.backend.controller;

import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import collzap.backend.dto.UserDtos.PeerProfileResponse;
import collzap.backend.security.AuthPrincipal;
import collzap.backend.service.UserService;

/**
 * Viewing someone else's profile. Deliberately narrow: a peer profile carries no
 * email, honours the other person's visibility setting, and is only readable by
 * someone who actually shares a group with them.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{userId}")
    public PeerProfileResponse peerProfile(
        @AuthenticationPrincipal AuthPrincipal me,
        @PathVariable UUID userId
    ) {
        return userService.peerProfile(me.userId(), userId);
    }
}
