package collzap.backend.enums;

public enum SeriousnessLevel {
    BEGINNER(1, "You are just getting started — and that is a perfectly good place to be."),
    LEARNING(2, "You are building real momentum. Keep showing up."),
    INTERMEDIATE(3, "You know your way around. Time to find peers who push you."),
    EXPERT(4, "You are seriously deep in this. Let us find peers on your level.");

    private final int rank;
    private final String message;

    SeriousnessLevel(int rank, String message) {
        this.rank = rank;
        this.message = message;
    }

    public int rank() {
        return rank;
    }

    public String message() {
        return message;
    }

    /** Server-side banding of a 0-100 percentage score. */
    public static SeriousnessLevel fromScore(int scorePercent) {
        if (scorePercent <= 40) {
            return BEGINNER;
        }
        if (scorePercent <= 60) {
            return LEARNING;
        }
        if (scorePercent <= 80) {
            return INTERMEDIATE;
        }
        return EXPERT;
    }

    /** Matching runs with a plus/minus one level tolerance. */
    public boolean isCompatibleWith(SeriousnessLevel other) {
        return Math.abs(rank - other.rank) <= 1;
    }
}
