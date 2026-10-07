package com.job_tracker.job.tracker;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@RestController
public class AppUserController {

    private final AppRepository repository;
    private final NotificationService notificationService;

    public AppUserController(AppRepository repository, NotificationService notificationService) {
        this.repository = repository;
        this.notificationService = notificationService;
    }

    @PostMapping("/api/applications")
    public AppUser saveApplication(@RequestBody AppUser application) {
        AppUser saved = repository.save(application);
        notificationService.broadcast(
                application.getJobTitle() != null ? application.getJobTitle() : "New Job",
                application.getCompany() != null ? application.getCompany() : "Unknown Company"
        );
        return saved;
    }

    @GetMapping("/api/applications")
    public List<AppUser> getApplications() {
        return repository.findAll();
    }
}
