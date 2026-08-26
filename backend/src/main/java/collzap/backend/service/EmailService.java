package collzap.backend.service;

import java.time.Duration;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import collzap.backend.config.CollzapProperties;

/**
 * Transactional email via Resend. When no API key is configured the message is
 * logged instead of sent, so local development needs no outbound credentials.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final CollzapProperties properties;
    private final RestClient restClient;

    public EmailService(CollzapProperties properties, RestClient.Builder restClientBuilder) {
        this.properties = properties;
        this.restClient = restClientBuilder.build();
    }

    public void sendOtp(String to, String code, Duration ttl) {
        long minutes = Math.max(1, ttl.toMinutes());
        String subject = "Your Collzap verification code";
        String html = """
            <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px">
              <h2 style="margin:0 0 12px">Verify your college email</h2>
              <p style="margin:0 0 20px;color:#444">
                Use this code to continue on Collzap. It expires in %d minutes.
              </p>
              <p style="font-size:32px;letter-spacing:6px;font-weight:700;margin:0 0 20px">%s</p>
              <p style="margin:0;color:#777;font-size:13px">
                If you did not request this, you can ignore this email.
              </p>
            </div>
            """.formatted(minutes, code);
        send(to, subject, html);
    }

    public void sendVerificationApproved(String to, String name) {
        send(to, "You are verified on Collzap", """
            <div style="font-family:system-ui,sans-serif;max-width:480px">
              <h2>You are in, %s</h2>
              <p>Your college verification was approved. Head back to Collzap to find your peers.</p>
            </div>
            """.formatted(escape(name)));
    }

    public void sendVerificationRejected(String to, String name, String reason) {
        send(to, "Action needed on your Collzap verification", """
            <div style="font-family:system-ui,sans-serif;max-width:480px">
              <h2>We could not verify that document, %s</h2>
              <p>%s</p>
              <p>Upload a clearer fee slip or ID card and we will take another look.</p>
            </div>
            """.formatted(escape(name), escape(reason == null ? "The document was not readable." : reason)));
    }

    /**
     * Fire-and-forget: a failing mail provider must not fail the caller's
     * transaction. Failures are logged for follow-up.
     */
    @Async
    public void send(String to, String subject, String html) {
        String apiKey = properties.getMail().getResendApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("No Resend API key configured; email to {} not sent. Subject: {}", to, subject);
            return;
        }
        Map<String, Object> body = Map.of(
            "from", "%s <%s>".formatted(properties.getMail().getFromName(), properties.getMail().getFromAddress()),
            "to", new String[] {to},
            "subject", subject,
            "html", html
        );
        try {
            restClient.post()
                .uri(properties.getMail().getApiUrl())
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toBodilessEntity();
            log.debug("Sent email to {} with subject {}", to, subject);
        } catch (RestClientException ex) {
            log.error("Failed to send email to {} with subject {}", to, subject, ex);
        }
    }

    private static String escape(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
