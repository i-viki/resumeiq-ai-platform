package com.resumeiq.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class JobDto {

    @Data
    public static class JobAnalysisRequest {
        @NotBlank
        private String title;

        private String company;

        @NotBlank
        private String description;
    }

    @Data
    public static class JobAnalysisResponse {
        private Long id;
        private String title;
        private String company;
        private String extractedSkills;
        private String extractedRequirements;
    }
}
