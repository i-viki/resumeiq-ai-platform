package com.resumeiq.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DashboardDto {
    private long totalAnalyses;
    private double averageScore;
    private long resumesUploaded;
    private List<RecentAnalysis> recentAnalyses;

    @Data
    @Builder
    public static class RecentAnalysis {
        private Long id;
        private String jobTitle;
        private Double overallScore;
        private String status;
        private String createdAt;
    }
}
