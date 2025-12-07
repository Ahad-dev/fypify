package com.fypify.backend.security;

import com.fypify.backend.entity.User;
import com.fypify.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;

/**
 * Custom User Details Service
 * 
 * SOLID Principles Applied:
 * 1. Single Responsibility Principle (SRP):
 *    - ONLY loads user details for Spring Security
 *    - No authentication logic
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - Depends on UserRepository interface (abstraction)
 *    - Spring Security depends on UserDetailsService interface (abstraction)
 * 
 * 3. Interface Segregation Principle (ISP):
 *    - Implements UserDetailsService interface
 *    - Only one method: loadUserByUsername
 * 
 * Design Pattern: Adapter Pattern
 * - Adapts our User entity to Spring Security's UserDetails
 * - Bridges the gap between:
 *   * Our domain model (User)
 *   * Spring Security's expected interface (UserDetails)
 * 
 * Benefits of Adapter Pattern:
 * - Spring Security works with UserDetails
 * - We keep our User entity clean (no Spring Security dependencies)
 * - Can switch security framework without changing User entity
 * - Separation of concerns
 * 
 * Best Practices:
 * - Constructor injection
 * - Logging for security
 * - Proper exception handling
 * - Convert our Role enum to Spring Security's GrantedAuthority
 */
@Slf4j
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Constructor Injection (DIP)
     * 
     * @param userRepository user repository
     */
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Load user by username (email in our case)
     * Adapter method: converts User to UserDetails
     * 
     * @param username email
     * @return UserDetails
     * @throws UsernameNotFoundException if user not found
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("Loading user by email: {}", username);

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> {
                    log.warn("User not found: {}", username);
                    return new UsernameNotFoundException("User not found with email: " + username);
                });

        log.debug("User loaded successfully: {}", username);

        // Adapt our User entity to Spring Security's UserDetails
        return new org.springframework.security.core.userdetails.User(
            user.getEmail(),
            user.getPassword(),
            user.getIsActive(), // enabled
            true, // accountNonExpired
            true, // credentialsNonExpired
            true, // accountNonLocked
            getAuthorities(user) // authorities
        );
    }

    /**
     * Convert our Role enum to Spring Security's GrantedAuthority
     * 
     * Spring Security expects authorities in format: ROLE_ADMIN, ROLE_STUDENT, etc.
     * We prefix with "ROLE_" for consistency
     * 
     * @param user user
     * @return collection of authorities
     */
    private Collection<? extends GrantedAuthority> getAuthorities(User user) {
        // Convert single role to Spring Security authority
        String authority = "ROLE_" + user.getRole().name();
        
        log.debug("User {} has authority: {}", user.getEmail(), authority);
        
        return Collections.singletonList(new SimpleGrantedAuthority(authority));
    }
}
