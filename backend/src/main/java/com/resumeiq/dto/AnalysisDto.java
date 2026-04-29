package com.resumeiq.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

public class AnalysisDto {

    @Data
    public static class ScoreEvaluationRequest {
        private Long resumeId;
        private Long jobDescriptionId;
    }

    @Data
    public static class AnalysisResponse {
        private Long id;
        private Double overallScore;
        private Double skillMatchScore;
        private Double experienceRelevanceScore;
        private Double keywordOptimizationScore;
        private Double resumeStructureScore;
        private Double aiFeedbackScore;
        private List<String> matchedSkills;
        private List<String> missingSkills;
        private List<String> recommendations;
        private String aiAnalysis;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime completedAt;
    }
}
