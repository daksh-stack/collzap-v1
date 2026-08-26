package collzap.backend.service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import collzap.backend.enums.SeriousnessLevel;
import collzap.backend.models.SeriousnessTestAttempt;
import collzap.backend.repositories.SeriousnessTestAttemptRepository;

/**
 * A user's current standing per interest: the newest submitted attempt wins.
 * Shared by the profile, matching and chat layers, which all need the level tag
 * without dragging in the whole test service.
 */
@Component
public class SeriousnessLevelLookup {

    private final SeriousnessTestAttemptRepository attemptRepository;

    public SeriousnessLevelLookup(SeriousnessTestAttemptRepository attemptRepository) {
        this.attemptRepository = attemptRepository;
    }

    /** Interest id to newest submitted attempt, newest-first ordering preserved. */
    @Transactional(readOnly = true)
    public Map<UUID, SeriousnessTestAttempt> latestByInterest(UUID userId) {
        Map<UUID, SeriousnessTestAttempt> latest = new LinkedHashMap<>();
        for (SeriousnessTestAttempt attempt : attemptRepository.findSubmittedByUserIdNewestFirst(userId)) {
            latest.putIfAbsent(attempt.getInterest().getId(), attempt);
        }
        return latest;
    }

    @Transactional(readOnly = true)
    public Map<UUID, SeriousnessLevel> levelsByInterest(UUID userId) {
        Map<UUID, SeriousnessLevel> levels = new HashMap<>();
        latestByInterest(userId).forEach((interestId, attempt) -> {
            if (attempt.getLevel() != null) {
                levels.put(interestId, attempt.getLevel());
            }
        });
        return levels;
    }

    @Transactional(readOnly = true)
    public Optional<SeriousnessLevel> levelFor(UUID userId, UUID interestId) {
        return Optional.ofNullable(levelsByInterest(userId).get(interestId));
    }

    /**
     * The latest retake-unlock date across every interest, which is what the score
     * screen's "Retake in 30 days" link shows.
     */
    @Transactional(readOnly = true)
    public Optional<LocalDate> nextRetakeDate(UUID userId) {
        return latestByInterest(userId).values().stream()
            .map(SeriousnessTestAttempt::getNextRetakeDate)
            .filter(java.util.Objects::nonNull)
            .max(LocalDate::compareTo);
    }
}
