package com.resumeiq.controller;

import com.resumeiq.dto.AnalysisDto;
import com.resumeiq.entity.AnalysisResult;
import com.resumeiq.entity.User;
import com.resumeiq.repository.UserRepository;
import com.resumeiq.service.AtsScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnalysisController {

    private final AtsScoreService atsScoreService;
    private final UserRepository userRepository;

    @PostMapping("/score/evaluate")
    public ResponseEntity<java.util.Map<String, Long>> evaluate(
            @RequestBody AnalysisDto.ScoreEvaluationRequest request,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long analysisId = atsScoreService.startEvaluation(request.getResumeId(), request.getJobDescriptionId(), user);

        return ResponseEntity.accepted().body(java.util.Map.of("analysisId", analysisId));
    }

    @GetMapping("/analysis/{id}")
    public ResponseEntity<AnalysisDto.AnalysisResponse> getAnalysis(@PathVariable Long id) {
        AnalysisResult result = atsScoreService.getAnalysis(id);

        AnalysisDto.AnalysisResponse response = new AnalysisDto.AnalysisResponse();
        response.setId(result.getId());
        response.setOverallScore(result.getOverallScore());
        response.setSkillMatchScore(result.getSkillMatchScore());
        response.setExperienceRelevanceScore(result.getExperienceRelevanceScore());
        response.setKeywordOptimizationScore(result.getKeywordOptimizationScore());
        response.setResumeStructureScore(result.getResumeStructureScore());
        response.setAiFeedbackScore(result.getAiFeedbackScore());
        response.setAiAnalysis(result.getAiAnalysis());
        response.setRecommendations(result.getRecommendations() != null ? java.util.List.of(result.getRecommendations().split("\\|")) : null);
        response.setMatchedSkills(result.getMatchedSkills() != null ? java.util.List.of(result.getMatchedSkills().split(",")) : null);
        response.setMissingSkills(result.getMissingSkills() != null ? java.util.List.of(result.getMissingSkills().split(",")) : null);
        response.setStatus(result.getStatus().name());
        response.setCreatedAt(result.getCreatedAt());
        response.setCompletedAt(result.getCompletedAt());

        return ResponseEntity.ok(response);
    }
}
