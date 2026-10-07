package com.job_tracker.job.tracker;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class CompController {

    private final CompRepository jobRepo;

    public CompController(CompRepository jobRepo) {
        this.jobRepo = jobRepo;
    }

    // === Get all jobs ===
    @GetMapping
    public List<CompUser> getAllJobs() {
        return jobRepo.findAll();
    }

    // === Add new job ===
    @PostMapping
    public CompUser addJob(@RequestBody CompUser job) {
        return jobRepo.save(job);
    }

    // === Delete job ===
    @DeleteMapping("/{id}")
    public void deleteJob(@PathVariable Long id) {
        jobRepo.deleteById(id);
    }
}
