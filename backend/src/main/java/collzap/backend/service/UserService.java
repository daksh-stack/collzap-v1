package collzap.backend.service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import collzap.backend.dto.UserDtos.PeerProfileResponse;
import collzap.backend.dto.UserDtos.PeerProfileResponse.PeerInterest;
import collzap.backend.dto.UserDtos.RegisterDeviceRequest;
import collzap.backend.dto.UserDtos.SettingsResponse;
import collzap.backend.dto.UserDtos.UpdatePhotoRequest;
import collzap.backend.dto.UserDtos.UpdateProfileRequest;
import collzap.backend.dto.UserDtos.UpdateSettingsRequest;
import collzap.backend.dto.UserDtos.UserResponse;
import collzap.backend.enums.SeriousnessLevel;
import collzap.backend.enums.Status;
import collzap.backend.exception.ForbiddenException;
import collzap.backend.exception.NotFoundException;
import collzap.backend.models.College;
import collzap.backend.models.DeviceToken;
import collzap.backend.models.User;
import collzap.backend.repositories.DeviceTokenRepository;
import collzap.backend.repositories.MatchMemberRepository;
import collzap.backend.repositories.RefreshTokenRepository;
import collzap.backend.repositories.UserInterestSelectionRepository;
import collzap.backend.repositories.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CollegeService collegeService;
    private final UserInterestSelectionRepository interestSelectionRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final MatchMemberRepository matchMemberRepository;
    private final SeriousnessLevelLookup levelLookup;

    public UserService(
        UserRepository userRepository,
        CollegeService collegeService,
        UserInterestSelectionRepository interestSelectionRepository,
        DeviceTokenRepository deviceTokenRepository,
        RefreshTokenRepository refreshTokenRepository,
        MatchMemberRepository matchMemberRepository,
        SeriousnessLevelLookup levelLookup
    ) {
        this.userRepository = userRepository;
        this.collegeService = collegeService;
        this.interestSelectionRepository = interestSelectionRepository;
        this.deviceTokenRepository = deviceTokenRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.matchMemberRepository = matchMemberRepository;
        this.levelLookup = levelLookup;
    }

    @Transactional(readOnly = true)
    public User require(UUID userId) {
        User user = userRepository.findWithCollegeById(userId)
            .orElseThrow(() -> new NotFoundException("User not found"));
        if (user.getAccountStatus() == Status.DELETED) {
            throw new ForbiddenException("This account has been deleted");
        }
        return user;
    }

    @Transactional(readOnly = true)
    public UserResponse me(UUID userId) {
        return toResponse(require(userId));
    }

    /**
     * Profile setup and later edits both land here. College is mandatory and can be
     * changed, but only to the one that owns the user's email domain — the email is
     * what was verified, so it stays the source of truth.
     */
    @Transactional
    public UserResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = require(userId);
        College college = collegeService.getById(request.collegeId());

        user.setCollege(college);
        user.setName(request.name().trim());
        user.setProfilePhotoUrl(trimToNull(request.profilePhotoUrl()));
        user.setYearOfStudy(request.yearOfStudy());
        user.setCity(trimToNull(request.city()));
        user.setStoryPrompt1(trimToNull(request.storyPrompt1()));
        user.setStoryPrompt2(trimToNull(request.storyPrompt2()));
        user.setStoryPrompt3(trimToNull(request.storyPrompt3()));
        user.setProofOfWorkUrl(trimToNull(request.proofOfWorkUrl()));
        user.setProfileCompleted(user.profileCompletionPercent() == 100);

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updatePhoto(UUID userId, UpdatePhotoRequest request) {
        User user = require(userId);
        user.setProfilePhotoUrl(request.profilePhotoUrl().trim());
        user.setProfileCompleted(user.profileCompletionPercent() == 100);
        return toResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public SettingsResponse settings(UUID userId) {
        User user = require(userId);
        return new SettingsResponse(user.isNotificationsEnabled(), user.isProfileVisible());
    }

    @Transactional
    public SettingsResponse updateSettings(UUID userId, UpdateSettingsRequest request) {
        User user = require(userId);
        if (request.notificationsEnabled() != null) {
            user.setNotificationsEnabled(request.notificationsEnabled());
        }
        if (request.profileVisible() != null) {
            user.setProfileVisible(request.profileVisible());
        }
        userRepository.save(user);
        return new SettingsResponse(user.isNotificationsEnabled(), user.isProfileVisible());
    }

    /**
     * A peer's profile. Only visible to someone who shares a live match group, so
     * the directory cannot be walked by guessing ids.
     */
    @Transactional(readOnly = true)
    public PeerProfileResponse peerProfile(UUID viewerId, UUID targetId) {
        if (viewerId.equals(targetId)) {
            return toPeerProfile(require(targetId));
        }
        if (!sharesGroup(viewerId, targetId)) {
            throw new ForbiddenException("You can only view profiles of peers you are connected with");
        }
        User target = require(targetId);
        if (!target.isProfileVisible()) {
            throw new ForbiddenException("This peer has hidden their profile");
        }
        return toPeerProfile(target);
    }

    @Transactional
    public void registerDevice(UUID userId, RegisterDeviceRequest request) {
        User user = require(userId);
        String token = request.token().trim();
        deviceTokenRepository.findByToken(token).ifPresentOrElse(
            existing -> {
                existing.setUser(user);
                existing.setPlatform(trimToNull(request.platform()));
                deviceTokenRepository.save(existing);
            },
            () -> deviceTokenRepository.save(
                new DeviceToken(user, token, trimToNull(request.platform())))
        );
    }

    @Transactional
    public void unregisterDevice(UUID userId, String token) {
        deviceTokenRepository.findByToken(token)
            .filter(device -> device.getUser().getId().equals(userId))
            .ifPresent(deviceTokenRepository::delete);
    }

    @Transactional
    public void touchLastSeen(UUID userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setLastSeenAt(Instant.now());
            userRepository.save(user);
        });
    }

    /**
     * Soft delete: the row stays so message history and match records keep their
     * foreign keys, but every credential and device is revoked and the profile is
     * hidden.
     *
     * <p>Group membership is torn down separately by
     * {@code MatchingService.leaveAllGroups}, which the caller runs first — that
     * keeps the requeue-and-notify rules in one place.
     */
    @Transactional
    public void deleteAccount(UUID userId) {
        User user = require(userId);
        user.setAccountStatus(Status.DELETED);
        user.setProfileVisible(false);
        user.setNotificationsEnabled(false);
        userRepository.save(user);

        refreshTokenRepository.revokeAllForUser(userId, Instant.now());
        deviceTokenRepository.deleteByUserId(userId);
    }

    private boolean sharesGroup(UUID viewerId, UUID targetId) {
        List<UUID> viewerGroupIds = matchMemberRepository.findActiveWithGroupByUserId(viewerId).stream()
            .map(member -> member.getMatchGroup().getId())
            .toList();
        if (viewerGroupIds.isEmpty()) {
            return false;
        }
        return matchMemberRepository.findActiveWithUserByGroupIdIn(viewerGroupIds).stream()
            .anyMatch(member -> member.getUser().getId().equals(targetId));
    }

    private PeerProfileResponse toPeerProfile(User user) {
        Map<UUID, SeriousnessLevel> levels = levelLookup.levelsByInterest(user.getId());
        List<PeerInterest> interests = interestSelectionRepository
            .findAllWithInterestByUserId(user.getId()).stream()
            .map(selection -> new PeerInterest(
                selection.getInterest().getName(),
                selection.getProjectType(),
                selection.getSubTag(),
                levels.get(selection.getInterest().getId())
            ))
            .toList();

        return new PeerProfileResponse(
            user.getId(),
            user.getName(),
            user.getProfilePhotoUrl(),
            user.getCollege().getName(),
            user.getYearOfStudy(),
            user.getCity(),
            user.getStoryPrompt1(),
            user.getStoryPrompt2(),
            user.getStoryPrompt3(),
            user.getProofOfWorkUrl(),
            interests
        );
    }

    public static UserResponse toResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getCollege().getId(),
            user.getCollege().getName(),
            user.getProfilePhotoUrl(),
            user.getYearOfStudy(),
            user.getCity(),
            user.getStoryPrompt1(),
            user.getStoryPrompt2(),
            user.getStoryPrompt3(),
            user.getProofOfWorkUrl(),
            user.getVerificationStatus(),
            user.getRejectionReason(),
            user.isProfileCompleted(),
            user.profileCompletionPercent(),
            user.isNotificationsEnabled(),
            user.isProfileVisible(),
            user.getAccountStatus(),
            user.getCreatedAt()
        );
    }

    static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
