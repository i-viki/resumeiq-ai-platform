package com.resumeiq.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeiq.dto.JobDto;
import com.resumeiq.entity.JobDescription;
import com.resumeiq.entity.User;
import com.resumeiq.repository.JobDescriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobDescriptionService {

    private final JobDescriptionRepository jobDescriptionRepository;
    private final GeminiAiService geminiAiService;
    private final ObjectMapper objectMapper;

    public JobDescription analyzeAndSave(JobDto.JobAnalysisRequest request, User user) {
        String extractedSkills = null;
        String extractedRequirements = null;

        try {
            String aiResponse = geminiAiService.extractSkillsFromJobDescription(request.getDescription());
            if (aiResponse != null) {
                String json = aiResponse.trim();
                if (json.startsWith("```")) {
                    json = json.replaceAll("^```(?:json)?\\s*", "").replaceAll("\\s*```$", "");
                }
                JsonNode root = objectMapper.readTree(json);

                if (root.has("skills") && root.get("skills").isArray()) {
                    List<String> skills = StreamSupport.stream(root.get("skills").spliterator(), false)
                            .map(JsonNode::asText).toList();
                    extractedSkills = String.join(",", skills);
                }
                if (root.has("requirements") && root.get("requirements").isArray()) {
                    List<String> reqs = StreamSupport.stream(root.get("requirements").spliterator(), false)
                            .map(JsonNode::asText).toList();
                    extractedRequirements = String.join(",", reqs);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to extract skills from job description: {}", e.getMessage());
        }

        JobDescription jd = JobDescription.builder()
                .user(user)
                .title(request.getTitle())
                .company(request.getCompany())
                .description(request.getDescription())
                .extractedSkills(extractedSkills)
                .extractedRequirements(extractedRequirements)
                .build();

        return jobDescriptionRepository.save(jd);
    }

    public JobDescription getJobDescription(Long id) {
        return jobDescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job description not found"));
    }
}
