package com.job_tracker.job.tracker;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // so JS frontend can call it
public class DashboardRestController {

    private final AppRepository appRepo;

    public DashboardRestController(AppRepository appRepo) {
        this.appRepo = appRepo;
    }

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", appRepo.count());
        stats.put("applied", appRepo.countByStatus(JobStatus.APPLIED));
        stats.put("interviewing", appRepo.countByStatus(JobStatus.INTERVIEWING));
        stats.put("offer", appRepo.countByStatus(JobStatus.OFFER));
        stats.put("rejected", appRepo.countByStatus(JobStatus.REJECTED));
        return stats;
    }
}
