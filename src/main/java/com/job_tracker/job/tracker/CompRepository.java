package com.job_tracker.job.tracker;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CompRepository extends JpaRepository<CompUser,Long> {
}
