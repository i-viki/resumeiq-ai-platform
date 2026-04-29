package com.resumeiq.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeiq.entity.AnalysisResult;
import com.resumeiq.entity.JobDescription;
import com.resumeiq.entity.Resume;
import com.resumeiq.entity.User;
import com.resumeiq.repository.AnalysisResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
@Slf4j
public class AtsScoreService {

    private static final double SKILL_MATCH_WEIGHT = 0.45;
    private static final double EXPERIENCE_RELEVANCE_WEIGHT = 0.20;
    private static final double KEYWORD_OPTIMIZATION_WEIGHT = 0.15;
    private static final double RESUME_STRUCTURE_WEIGHT = 0.10;
    private static final double AI_FEEDBACK_WEIGHT = 0.10;

    private final AnalysisResultRepository analysisResultRepository;
    private final ResumeParsingService resumeParsingService;
    private final JobDescriptionService jobDescriptionService;
    private final GeminiAiService geminiAiService;
    private final ObjectMapper objectMapper;

    public Long startEvaluation(Long resumeId, Long jobDescriptionId, User user) {
        Resume resume = resumeParsingService.getResume(resumeId);
        JobDescription jd = jobDescriptionService.getJobDescription(jobDescriptionId);

        AnalysisResult result = AnalysisResult.builder()
                .resume(resume)
                .jobDescription(jd)
                .user(user)
                .status(AnalysisResult.AnalysisStatus.PENDING)
                .build();
        result = analysisResultRepository.save(result);

        runAnalysis(result.getId());
        return result.getId();
    }

    @Async
    public void runAnalysis(Long analysisId) {
        AnalysisResult result = analysisResultRepository.findById(analysisId)
                .orElseThrow(() -> new RuntimeException("Analysis not found"));
        result.setStatus(AnalysisResult.AnalysisStatus.PROCESSING);
        result = analysisResultRepository.save(result);

        try {
            String aiResponse = geminiAiService.compareResumeToJob(
                    result.getResume().getExtractedText(), result.getJobDescription().getDescription());

            result.setAiAnalysis(aiResponse);
            parseAndPopulateScores(result, aiResponse);
            result.setOverallScore(calculateOverallScore(result));
            result.setStatus(AnalysisResult.AnalysisStatus.COMPLETED);
            result.setCompletedAt(LocalDateTime.now());
        } catch (Exception e) {
            log.error("Analysis failed for id {}: {}", analysisId, e.getMessage(), e);
            result.setStatus(AnalysisResult.AnalysisStatus.FAILED);
        }

        analysisResultRepository.save(result);
    }

    private void parseAndPopulateScores(AnalysisResult result, String aiResponse) {
        try {
            // Strip markdown code fences if present
            String json = aiResponse.trim();
            if (json.startsWith("```")) {
                json = json.replaceAll("^```(?:json)?\\s*", "").replaceAll("\\s*```$", "");
            }

            JsonNode root = objectMapper.readTree(json);

            result.setSkillMatchScore(root.path("skillMatchScore").asDouble(0));
            result.setExperienceRelevanceScore(root.path("experienceRelevanceScore").asDouble(0));
            result.setKeywordOptimizationScore(root.path("keywordOptimizationScore").asDouble(0));
            result.setResumeStructureScore(root.path("resumeStructureScore").asDouble(0));
            result.setAiFeedbackScore(root.path("aiFeedbackScore").asDouble(0));

            if (root.has("matchedSkills") && root.get("matchedSkills").isArray()) {
                List<String> matched = StreamSupport.stream(root.get("matchedSkills").spliterator(), false)
                        .map(JsonNode::asText)
                        .toList();
                result.setMatchedSkills(String.join(",", matched));
            }

            if (root.has("missingSkills") && root.get("missingSkills").isArray()) {
                List<String> missing = StreamSupport.stream(root.get("missingSkills").spliterator(), false)
                        .map(JsonNode::asText)
                        .toList();
                result.setMissingSkills(String.join(",", missing));
            }

            if (root.has("recommendations") && root.get("recommendations").isArray()) {
                List<String> recs = StreamSupport.stream(root.get("recommendations").spliterator(), false)
                        .map(JsonNode::asText)
                        .toList();
                result.setRecommendations(String.join("|", recs));
            }
        } catch (Exception e) {
            log.warn("Failed to parse AI response JSON, using defaults: {}", e.getMessage());
            result.setSkillMatchScore(0.0);
            result.setExperienceRelevanceScore(0.0);
            result.setKeywordOptimizationScore(0.0);
            result.setResumeStructureScore(0.0);
            result.setAiFeedbackScore(0.0);
        }
    }

    private double calculateOverallScore(AnalysisResult result) {
        return (result.getSkillMatchScore() * SKILL_MATCH_WEIGHT)
                + (result.getExperienceRelevanceScore() * EXPERIENCE_RELEVANCE_WEIGHT)
                + (result.getKeywordOptimizationScore() * KEYWORD_OPTIMIZATION_WEIGHT)
                + (result.getResumeStructureScore() * RESUME_STRUCTURE_WEIGHT)
                + (result.getAiFeedbackScore() * AI_FEEDBACK_WEIGHT);
    }

    public AnalysisResult getAnalysis(Long id) {
        return analysisResultRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Analysis not found"));
    }

    public List<AnalysisResult> getUserAnalyses(Long userId) {
        return analysisResultRepository.findByUserId(userId);
    }
}
