package com.job_tracker.job.tracker;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final AppRepository appRepo;

    public DashboardController(AppRepository appRepo) {
        this.appRepo = appRepo;
    }

    @GetMapping
    public Map<String, Object> getDashboardData() {
        List<AppUser> apps = appRepo.findAll();

        long total = apps.size();
        long applied = apps.stream().filter(a -> a.getStatus() == JobStatus.APPLIED).count();
        long interviewing = apps.stream().filter(a -> a.getStatus() == JobStatus.INTERVIEWING).count();
        long offer = apps.stream().filter(a -> a.getStatus() == JobStatus.OFFER).count();
        long rejected = apps.stream().filter(a -> a.getStatus() == JobStatus.REJECTED).count();

        Map<String, Object> data = new HashMap<>();
        data.put("totalApplications", total);
        data.put("stages", Map.of(
                "applied", applied,
                "interviewing", interviewing,
                "offer", offer,
                "rejected", rejected
        ));
        return data;
    }
}
