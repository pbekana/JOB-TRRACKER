package com.job_tracker.job.tracker;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

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

    // === Update job status (for drag-and-drop) ===
    @PatchMapping("/{id}/status")
    public ResponseEntity<CompUser> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return jobRepo.findById(id).map(job -> {
            job.setStatus(body.get("status"));
            return ResponseEntity.ok(jobRepo.save(job));
        }).orElse(ResponseEntity.notFound().build());
    }

    // === Delete job ===
    @DeleteMapping("/{id}")
    public void deleteJob(@PathVariable Long id) {
        jobRepo.deleteById(id);
    }
}
