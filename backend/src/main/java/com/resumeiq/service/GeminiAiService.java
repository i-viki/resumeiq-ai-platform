package com.resumeiq.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GeminiAiService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${app.gemini.api-key:}")
    private String apiKey;

    @Value("${app.gemini.model:gemini-pro}")
    private String model;

    public GeminiAiService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
        this.objectMapper = objectMapper;
    }

    /**
     * Sends a prompt to the Gemini API and returns the response text.
     */
    public String analyze(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.3,
                        "maxOutputTokens", 4096
                )
        );

        try {
            String responseJson = webClient.post()
                    .uri("/v1beta/models/{model}:generateContent?key={key}", model, apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                return candidates.get(0)
                        .path("content")
                        .path("parts")
                        .get(0)
                        .path("text")
                        .asText();
            }

            log.warn("Gemini API returned no candidates: {}", responseJson);
            return null;
        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage(), e);
            throw new RuntimeException("AI analysis failed: " + e.getMessage(), e);
        }
    }

    public String extractSkillsFromJobDescription(String jobDescription) {
        String prompt = """
                Analyze the following job description and extract information. Return ONLY valid JSON with this exact structure:
                {
                  "skills": ["skill1", "skill2"],
                  "requirements": ["requirement1", "requirement2"]
                }

                Job Description:
                """ + jobDescription;
        return analyze(prompt);
    }

    public String compareResumeToJob(String resumeText, String jobDescription) {
        String prompt = """
                You are an expert ATS (Applicant Tracking System) analyzer. Compare the following resume against the job description.
                
                Return ONLY valid JSON with this exact structure (no markdown, no extra text):
                {
                  "skillMatchScore": <0-100>,
                  "experienceRelevanceScore": <0-100>,
                  "keywordOptimizationScore": <0-100>,
                  "resumeStructureScore": <0-100>,
                  "aiFeedbackScore": <0-100>,
                  "matchedSkills": ["skill1", "skill2"],
                  "missingSkills": ["skill1", "skill2"],
                  "recommendations": ["recommendation1", "recommendation2"],
                  "summary": "Brief overall assessment"
                }
                
                Scoring guidelines:
                - skillMatchScore: How well do the resume's skills match the job requirements
                - experienceRelevanceScore: How relevant is the candidate's experience
                - keywordOptimizationScore: How well does the resume use keywords from the job description
                - resumeStructureScore: Quality of resume format, sections, and organization
                - aiFeedbackScore: Overall AI confidence in candidate-job fit
                
                Resume:
                """ + resumeText + """
                
                
                Job Description:
                """ + jobDescription;
        return analyze(prompt);
    }
}
