package collzap.backend.service;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import collzap.backend.models.DeviceToken;

/**
 * Delivers push payloads to a user's registered devices.
 *
 * <p>The provider credentials are not part of this backend's configuration yet, so
 * this logs the payload it would have sent. Every push in the app funnels through
 * here, which makes wiring FCM or APNs later a change to this one class rather
 * than a change to the services that raise notifications.
 */
@Component
public class PushDispatcher {

    private static final Logger log = LoggerFactory.getLogger(PushDispatcher.class);

    @Async
    public void dispatch(List<DeviceToken> devices, String title, String body, Map<String, Object> data) {
        if (devices.isEmpty()) {
            return;
        }
        for (DeviceToken device : devices) {
            log.info(
                "Push queued for device {} ({}): {} — {} {}",
                mask(device.getToken()),
                device.getPlatform() == null ? "unknown" : device.getPlatform(),
                title,
                body,
                data
            );
        }
    }

    private static String mask(String token) {
        if (token == null || token.length() <= 8) {
            return "********";
        }
        return token.substring(0, 4) + "…" + token.substring(token.length() - 4);
    }
}
