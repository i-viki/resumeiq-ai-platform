package com.resumeiq.repository;

import com.resumeiq.entity.RefreshToken;
import com.resumeiq.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    
    void deleteByUser(User user);
}
