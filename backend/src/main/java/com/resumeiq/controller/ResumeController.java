package com.resumeiq.controller;

import com.resumeiq.dto.ResumeDto;
import com.resumeiq.entity.Resume;
import com.resumeiq.entity.User;
import com.resumeiq.repository.UserRepository;
import com.resumeiq.service.ResumeParsingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeParsingService resumeParsingService;
    private final UserRepository userRepository;

    @PostMapping("/upload")
    public ResponseEntity<ResumeDto.ResumeUploadResponse> upload(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {
        User user = getUser(authentication);
        Resume resume = resumeParsingService.parseAndSave(file, user);

        ResumeDto.ResumeUploadResponse response = new ResumeDto.ResumeUploadResponse();
        response.setId(resume.getId());
        response.setFileName(resume.getFileName());
        response.setFileType(resume.getFileType());
        response.setExtractedTextPreview(
                resume.getExtractedText() != null
                        ? resume.getExtractedText().substring(0, Math.min(500, resume.getExtractedText().length()))
                        : null);

        return ResponseEntity.ok(response);
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
