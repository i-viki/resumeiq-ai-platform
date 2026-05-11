package com.resumeiq.controller;

import com.resumeiq.dto.DashboardDto;
import com.resumeiq.entity.AnalysisResult;
import com.resumeiq.entity.User;
import com.resumeiq.repository.ResumeRepository;
import com.resumeiq.repository.UserRepository;
import com.resumeiq.service.AtsScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final AtsScoreService atsScoreService;

    @GetMapping("/stats")
    @Transactional(readOnly = true)
    public ResponseEntity<DashboardDto> getStats(Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<AnalysisResult> analyses = atsScoreService.getUserAnalyses(user.getId());
        long resumeCount = resumeRepository.findByUserId(user.getId()).size();

        double avgScore = analyses.stream()
                .filter(a -> a.getOverallScore() != null && a.getStatus() == AnalysisResult.AnalysisStatus.COMPLETED)
                .mapToDouble(AnalysisResult::getOverallScore)
                .average()
                .orElse(0.0);

        List<DashboardDto.RecentAnalysis> recent = analyses.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(10)
                .map(a -> DashboardDto.RecentAnalysis.builder()
                        .id(a.getId())
                        .jobTitle(a.getJobDescription().getTitle())
                        .overallScore(a.getOverallScore())
                        .status(a.getStatus().name())
                        .createdAt(a.getCreatedAt().toString())
                        .build())
                .toList();

        DashboardDto dto = DashboardDto.builder()
                .totalAnalyses(analyses.size())
                .averageScore(Math.round(avgScore * 10.0) / 10.0)
                .resumesUploaded(resumeCount)
                .recentAnalyses(recent)
                .build();

        return ResponseEntity.ok(dto);
    }
}
