package com.job_tracker.job.tracker;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@RestController
public class AppUserController {

    private final AppRepository repository;

    public AppUserController(AppRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/api/applications")
    public AppUser saveApplication(@RequestBody AppUser application) {

        return repository.save(application);
    }

    @GetMapping("/api/applications")
    public List<AppUser> getApplications() {
        return repository.findAll();
    }
}



