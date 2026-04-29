package com.resumeiq.controller;

import com.resumeiq.dto.JobDto;
import com.resumeiq.entity.JobDescription;
import com.resumeiq.entity.User;
import com.resumeiq.repository.UserRepository;
import com.resumeiq.service.JobDescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/job")
@RequiredArgsConstructor
public class JobController {

    private final JobDescriptionService jobDescriptionService;
    private final UserRepository userRepository;

    @PostMapping("/analyze")
    public ResponseEntity<JobDto.JobAnalysisResponse> analyze(
            @Valid @RequestBody JobDto.JobAnalysisRequest request,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        JobDescription jd = jobDescriptionService.analyzeAndSave(request, user);

        JobDto.JobAnalysisResponse response = new JobDto.JobAnalysisResponse();
        response.setId(jd.getId());
        response.setTitle(jd.getTitle());
        response.setCompany(jd.getCompany());
        response.setExtractedSkills(jd.getExtractedSkills());
        response.setExtractedRequirements(jd.getExtractedRequirements());

        return ResponseEntity.ok(response);
    }
}
