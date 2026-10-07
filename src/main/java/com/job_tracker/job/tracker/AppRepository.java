package com.job_tracker.job.tracker;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AppRepository extends JpaRepository<AppUser, Long> {

    long countByStatus(JobStatus status);

    @Query("SELECT COUNT(a) FROM AppUser a")
    long countAll();
}

