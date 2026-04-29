package com.resumeiq.controller;

import com.resumeiq.dto.AuthDto;
import com.resumeiq.service.AuthService;
import com.resumeiq.service.RefreshTokenService;
import com.resumeiq.security.JwtTokenProvider;
import com.resumeiq.entity.RefreshToken;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/register")
    public ResponseEntity<AuthDto.AuthResponse> register(@Valid @RequestBody AuthDto.RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(@Valid @RequestBody AuthDto.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody AuthDto.RefreshTokenRequest request) {
        return refreshTokenService.findByToken(request.getRefreshToken())
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());
                    return ResponseEntity.ok(Map.of(
                            "token", token,
                            "refreshToken", request.getRefreshToken()
                    ));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is invalid or expired"));
    }
}
