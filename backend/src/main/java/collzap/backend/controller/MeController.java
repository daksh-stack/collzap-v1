package collzap.backend.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import collzap.backend.dto.AuthDtos.OtpIssuedResponse;
import collzap.backend.dto.AuthDtos.VerifyEmailRequest;
import collzap.backend.dto.CommonDtos.MessageResponse;
import collzap.backend.dto.UserDtos.OnboardingStateResponse;
import collzap.backend.dto.UserDtos.RegisterDeviceRequest;
import collzap.backend.dto.UserDtos.SettingsResponse;
import collzap.backend.dto.UserDtos.UpdatePhotoRequest;
import collzap.backend.dto.UserDtos.UpdateProfileRequest;
import collzap.backend.dto.UserDtos.UpdateSettingsRequest;
import collzap.backend.dto.UserDtos.UserResponse;
import collzap.backend.ratelimit.RateLimited;
import collzap.backend.security.AuthPrincipal;
import collzap.backend.service.AuthService;
import collzap.backend.service.MatchingService;
import collzap.backend.service.OnboardingService;
import collzap.backend.service.UserService;
import jakarta.validation.Valid;

/**
 * The signed-in user's own record: profile setup and edit, settings, devices and
 * account deletion. Everything is scoped to the token's user id, so there is no
 * path parameter to tamper with.
 */
@RestController
@RequestMapping("/api/me")
public class MeController {

    private final UserService userService;
    private final OnboardingService onboardingService;
    private final MatchingService matchingService;
    private final AuthService authService;

    public MeController(
        UserService userService,
        OnboardingService onboardingService,
        MatchingService matchingService,
        AuthService authService
    ) {
        this.userService = userService;
        this.onboardingService = onboardingService;
        this.matchingService = matchingService;
        this.authService = authService;
    }

    @GetMapping
    public UserResponse me(@AuthenticationPrincipal AuthPrincipal me) {
        return userService.me(me.userId());
    }

    /**
     * Which screen the app should show. Worth calling on launch: it collapses the
     * whole onboarding chain into one answer so a half-finished setup resumes in
     * the right place.
     */
    @GetMapping("/onboarding")
    public OnboardingStateResponse onboarding(@AuthenticationPrincipal AuthPrincipal me) {
        return onboardingService.describe(me.userId());
    }

    /** Confirms the login email during onboarding's VERIFY_EMAIL step. */
    @RateLimited(name = "verify-email", limit = 10, windowSeconds = 3600)
    @PostMapping("/verify-email")
    public OnboardingStateResponse verifyEmail(
        @AuthenticationPrincipal AuthPrincipal me,
        @Valid @RequestBody VerifyEmailRequest request
    ) {
        return authService.verifyEmail(me.userId(), request.code());
    }

    @RateLimited(name = "verify-email-resend", limit = 5, windowSeconds = 3600)
    @PostMapping("/verify-email/resend")
    public OtpIssuedResponse resendVerifyEmail(@AuthenticationPrincipal AuthPrincipal me) {
        return authService.resendVerifyEmail(me.userId());
    }

    /** Profile setup and later edits both post here. */
    @PutMapping("/profile")
    public UserResponse updateProfile(
        @AuthenticationPrincipal AuthPrincipal me,
        @Valid @RequestBody UpdateProfileRequest request
    ) {
        return userService.updateProfile(me.userId(), request);
    }

    /** The client uploads the image itself and sends back the URL. */
    @PatchMapping("/photo")
    public UserResponse updatePhoto(
        @AuthenticationPrincipal AuthPrincipal me,
        @Valid @RequestBody UpdatePhotoRequest request
    ) {
        return userService.updatePhoto(me.userId(), request);
    }

    @GetMapping("/settings")
    public SettingsResponse settings(@AuthenticationPrincipal AuthPrincipal me) {
        return userService.settings(me.userId());
    }

    /** Both fields are optional; anything omitted keeps its current value. */
    @PatchMapping("/settings")
    public SettingsResponse updateSettings(
        @AuthenticationPrincipal AuthPrincipal me,
        @RequestBody UpdateSettingsRequest request
    ) {
        return userService.updateSettings(me.userId(), request);
    }

    /** Registers a push token. Re-registering the same token is a no-op. */
    @RateLimited(name = "register-device", limit = 10, windowSeconds = 86400)
    @PostMapping("/devices")
    public MessageResponse registerDevice(
        @AuthenticationPrincipal AuthPrincipal me,
        @Valid @RequestBody RegisterDeviceRequest request
    ) {
        userService.registerDevice(me.userId(), request);
        return MessageResponse.of("Device registered");
    }

    @DeleteMapping("/devices/{token}")
    public MessageResponse unregisterDevice(
        @AuthenticationPrincipal AuthPrincipal me,
        @PathVariable String token
    ) {
        userService.unregisterDevice(me.userId(), token);
        return MessageResponse.of("Device removed");
    }

    /** Keeps "last seen" fresh; cheap enough to call on app foreground. */
    @PostMapping("/heartbeat")
    public MessageResponse heartbeat(@AuthenticationPrincipal AuthPrincipal me) {
        userService.touchLastSeen(me.userId());
        return MessageResponse.of("ok");
    }

    /** Revokes every refresh token, signing the account out of all devices. */
    @PostMapping("/logout-all")
    public MessageResponse logoutEverywhere(@AuthenticationPrincipal AuthPrincipal me) {
        authService.logoutEverywhere(me.userId());
        return MessageResponse.of("Signed out on all devices");
    }

    /**
     * Account deletion. The record is retired rather than erased so message history
     * in other people's chats does not develop holes. Groups are left first, so the
     * other side of a one-on-one goes back in the queue rather than being stranded.
     */
    @DeleteMapping
    public MessageResponse deleteAccount(@AuthenticationPrincipal AuthPrincipal me) {
        matchingService.leaveAllGroups(me.userId());
        userService.deleteAccount(me.userId());
        return MessageResponse.of("Your account has been deleted");
    }
}
