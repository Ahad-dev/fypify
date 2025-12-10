package com.fypify.backend.modules.auth.dto;

import com.fypify.backend.modules.user.dto.UserDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for login containing JWT token and user info.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String token;
    private String tokenType;
    private Long expiresIn;
    private UserDto user;

    public static LoginResponse of(String token, Long expiresIn, UserDto user) {
        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .user(user)
                .build();
    }
}
