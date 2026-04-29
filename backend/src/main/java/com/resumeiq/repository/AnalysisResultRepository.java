package com.resumeiq.repository;

import com.resumeiq.entity.AnalysisResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnalysisResultRepository extends JpaRepository<AnalysisResult, Long> {
    List<AnalysisResult> findByUserId(Long userId);
    List<AnalysisResult> findByResumeId(Long resumeId);
}
