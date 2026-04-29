package com.resumeiq.dto;

import lombok.Data;

public class ResumeDto {

    @Data
    public static class ResumeUploadResponse {
        private Long id;
        private String fileName;
        private String fileType;
        private String extractedTextPreview;
    }
}
