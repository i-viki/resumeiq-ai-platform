package com.resumeiq.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDto {

    @Data
    public static class RegisterRequest {
        @NotBlank
        private String fullName;

        @Email @NotBlank
        private String email;

        @NotBlank @Size(min = 8)
        private String password;

        private String role;
    }

    @Data
    public static class LoginRequest {
        @Email @NotBlank
        private String email;

        @NotBlank
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String refreshToken;
        private String email;
        private String fullName;
        private String role;
    }

    @Data
    public static class RefreshTokenRequest {
        @NotBlank
        private String refreshToken;
    }
}
