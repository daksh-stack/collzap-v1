package collzap.backend.enums;

/** Drives the tick shown next to a message: single, double, then blue. */
public enum ReceiptStatus {
    SENT,
    DELIVERED,
    READ;

    public int rank() {
        return ordinal();
    }
}
