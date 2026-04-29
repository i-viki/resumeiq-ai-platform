package com.resumeiq.service;

import com.resumeiq.entity.Resume;
import com.resumeiq.entity.User;
import com.resumeiq.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeParsingService {

    private final ResumeRepository resumeRepository;

    public Resume parseAndSave(MultipartFile file, User user) throws IOException {
        String extractedText = extractText(file);

        Resume resume = Resume.builder()
                .user(user)
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileData(file.getBytes())
                .extractedText(extractedText)
                .build();

        return resumeRepository.save(resume);
    }

    private String extractText(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        if ("application/pdf".equals(contentType)) {
            return extractTextFromPdf(file.getBytes());
        }
        // Add support for DOCX, TXT, etc. as needed
        return new String(file.getBytes());
    }

    private String extractTextFromPdf(byte[] pdfBytes) throws IOException {
        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    public List<Resume> getUserResumes(Long userId) {
        return resumeRepository.findByUserId(userId);
    }

    public Resume getResume(Long id) {
        return resumeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resume not found"));
    }
}
