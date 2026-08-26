package collzap.backend.enums;

/**
 * Long-term interests and short-term activities are two separate catalogues, so
 * the category doubles as the project type an interest belongs to.
 */
public enum InterestCategory {
    LONG_TERM,
    SHORT_TERM;

    public ProjectType projectType() {
        return this == LONG_TERM ? ProjectType.LONG_TERM : ProjectType.SHORT_TERM;
    }

    public static InterestCategory of(ProjectType projectType) {
        return projectType == ProjectType.LONG_TERM ? LONG_TERM : SHORT_TERM;
    }
}
