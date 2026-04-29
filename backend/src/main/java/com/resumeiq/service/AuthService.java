package com.resumeiq.service;

import com.resumeiq.dto.AuthDto;
import com.resumeiq.entity.User;
import com.resumeiq.repository.UserRepository;
import com.resumeiq.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.JOB_SEEKER)
                .build();

        userRepository.save(user);

        return buildAuthResponse(user);
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return buildAuthResponse(user);
    }

    private AuthDto.AuthResponse buildAuthResponse(User user) {
        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());
        com.resumeiq.entity.RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getEmail());
        
        AuthDto.AuthResponse response = new AuthDto.AuthResponse();
        response.setToken(token);
        response.setRefreshToken(refreshToken.getToken());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setRole(user.getRole().name());
        return response;
    }
}
