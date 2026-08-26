package collzap.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import collzap.backend.security.StompAuthChannelInterceptor;

/**
 * STOMP-over-WebSocket wiring for live chat.
 *
 * <p>Clients connect to {@code /ws}, subscribe to {@code /topic/rooms/{roomId}}
 * for room traffic and {@code /user/queue/...} for private frames, and publish
 * to {@code /app/...}.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final StompAuthChannelInterceptor authChannelInterceptor;
    private final CollzapProperties properties;

    public WebSocketConfig(
        StompAuthChannelInterceptor authChannelInterceptor,
        CollzapProperties properties
    ) {
        this.authChannelInterceptor = authChannelInterceptor;
        this.properties = properties;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
            .setAllowedOriginPatterns(properties.getCors().getAllowedOrigins().toArray(String[]::new))
            .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(authChannelInterceptor);
    }
}
