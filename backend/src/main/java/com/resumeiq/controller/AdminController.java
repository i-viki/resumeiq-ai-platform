package com.resumeiq.controller;

import com.resumeiq.entity.User;
import com.resumeiq.repository.UserRepository;
import com.resumeiq.repository.AnalysisResultRepository;
import com.resumeiq.entity.AnalysisResult;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final AnalysisResultRepository analysisResultRepository;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        try {
            User.Role newRole = User.Role.valueOf(request.get("role"));
            user.setRole(newRole);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Role updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role"));
        }
    }

    @GetMapping("/stats/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getStatsOverview() {
        long totalUsers = userRepository.count();
        List<AnalysisResult> analyses = analysisResultRepository.findAll();
        
        long totalAnalyses = analyses.size();
        double averageScore = analyses.stream()
                .filter(a -> a.getOverallScore() != null)
                .mapToDouble(AnalysisResult::getOverallScore)
                .average()
                .orElse(0.0);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalAnalyses", totalAnalyses);
        stats.put("averageScore", averageScore);
        
        return ResponseEntity.ok(stats);
    }
}
