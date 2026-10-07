package com.job_tracker.job.tracker;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;

@RestController
@RequestMapping("/api/uploads")
@CrossOrigin("*")
public class UploadController {

    @Value("${upload.dir}")
    private String uploadDir;

    @PostMapping
    public ResponseEntity<?> uploadFiles(
            @RequestParam("resume") MultipartFile resume,
            @RequestParam("coverLetter") MultipartFile coverLetter) {

        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

            String resumeFileName = System.currentTimeMillis() + "_" + resume.getOriginalFilename();
            String coverFileName = System.currentTimeMillis() + "_" + coverLetter.getOriginalFilename();

            Path resumePath = uploadPath.resolve(resumeFileName);
            Path coverPath = uploadPath.resolve(coverFileName);

            Files.copy(resume.getInputStream(), resumePath, StandardCopyOption.REPLACE_EXISTING);
            Files.copy(coverLetter.getInputStream(), coverPath, StandardCopyOption.REPLACE_EXISTING);

            return ResponseEntity.ok(new UploadResponse(
                    "/uploads/" + resumeFileName,
                    "/uploads/" + coverFileName
            ));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("File upload failed");
        }
    }

    // Simple DTO to return paths
    static class UploadResponse {
        public String resumePath;
        public String coverLetterPath;

        public UploadResponse(String resumePath, String coverLetterPath) {
            this.resumePath = resumePath;
            this.coverLetterPath = coverLetterPath;
        }
    }
}

