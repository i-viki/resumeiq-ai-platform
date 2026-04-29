package com.resumeiq.repository;

import com.resumeiq.entity.JobDescription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobDescriptionRepository extends JpaRepository<JobDescription, Long> {
    List<JobDescription> findByUserId(Long userId);
}
