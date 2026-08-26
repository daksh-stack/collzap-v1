package collzap.backend.enums;

public enum ConnectionType {
    /** Private pair. Opens the chat the moment the second member joins. */
    ONE_ON_ONE(2, 2),
    /** Opens at 2 members and keeps accepting new members up to 4. */
    SHORT_GROUP(2, 4),
    /** Long-term only. Unbounded community room, joined instantly. */
    SOCIETY(1, Integer.MAX_VALUE);

    private final int minMembersToOpen;
    private final int capacity;

    ConnectionType(int minMembersToOpen, int capacity) {
        this.minMembersToOpen = minMembersToOpen;
        this.capacity = capacity;
    }

    public int minMembersToOpen() {
        return minMembersToOpen;
    }

    public int capacity() {
        return capacity;
    }

    public boolean isAvailableFor(ProjectType projectType) {
        return this != SOCIETY || projectType == ProjectType.LONG_TERM;
    }

    public ChatRoomType chatRoomType() {
        return switch (this) {
            case ONE_ON_ONE -> ChatRoomType.ONE_ON_ONE;
            case SHORT_GROUP -> ChatRoomType.GROUP;
            case SOCIETY -> ChatRoomType.SOCIETY;
        };
    }
}
