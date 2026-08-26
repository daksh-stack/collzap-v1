package collzap.backend.enums;

public enum ProjectType {
    LONG_TERM,
    SHORT_TERM;

    /** Interest picks allowed per project type: 2 for long-term, 1 for short-term. */
    public int maxInterestSelections() {
        return this == LONG_TERM ? 2 : 1;
    }

    /** Only long-term peers sit the seriousness test; short-term buddies self-declare. */
    public boolean requiresSeriousnessTest() {
        return this == LONG_TERM;
    }
}
