package com.fypify.backend.config;

import com.fypify.backend.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.List;

/**
 * WebSocket Configuration for real-time notifications.
 * 
 * Uses STOMP protocol over SockJS for browser compatibility.
 * 
 * Endpoints:
 * - /ws - WebSocket connection endpoint (with SockJS fallback)
 * 
 * Destinations:
 * - /app/* - Application messages (client to server)
 * - /topic/* - Broadcast messages (server to all clients)
 * - /user/queue/* - User-specific messages (server to specific user)
 */
@Slf4j
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtTokenProvider jwtTokenProvider;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple in-memory message broker
        // /topic is for broadcasting to all subscribers
        // /queue is for user-specific messages
        config.enableSimpleBroker("/topic", "/queue");
        
        // Prefix for messages from client to server
        config.setApplicationDestinationPrefixes("/app");
        
        // Prefix for user-specific destinations
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register WebSocket endpoint with SockJS fallback
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(frontendUrl, "http://localhost:3000", "https://fypify.vercel.app")
                .withSockJS();
        
        // Also register without SockJS for native WebSocket clients
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(frontendUrl, "http://localhost:3000", "https://fypify.vercel.app");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    // Extract JWT token from headers
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        
                        try {
                            if (jwtTokenProvider.validateToken(token)) {
                                String userId = jwtTokenProvider.getUserIdFromJwt(token).toString();
                                String role = jwtTokenProvider.getRoleFromJwt(token);
                                
                                // Create authentication token
                                UsernamePasswordAuthenticationToken auth = 
                                    new UsernamePasswordAuthenticationToken(
                                        userId,
                                        null,
                                        List.of(new SimpleGrantedAuthority("ROLE_" + role))
                                    );
                                
                                accessor.setUser(auth);
                                log.debug("WebSocket authenticated for user: {}", userId);
                            }
                        } catch (Exception e) {
                            log.error("WebSocket authentication failed: {}", e.getMessage());
                        }
                    }
                }
                
                return message;
            }
        });
    }
}
