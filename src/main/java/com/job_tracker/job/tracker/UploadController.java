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
            @RequestParam(value = "resume", required = false) MultipartFile resume,
            @RequestParam(value = "coverLetter", required = false) MultipartFile coverLetter) {

        try {
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);

            String resumeFilePath = "";
            String coverFilePath = "";

            if (resume != null && !resume.isEmpty()) {
                String resumeFileName = System.currentTimeMillis() + "_" + resume.getOriginalFilename();
                Files.copy(resume.getInputStream(), uploadPath.resolve(resumeFileName), StandardCopyOption.REPLACE_EXISTING);
                resumeFilePath = "/uploads/" + resumeFileName;
            }

            if (coverLetter != null && !coverLetter.isEmpty()) {
                String coverFileName = System.currentTimeMillis() + "_" + coverLetter.getOriginalFilename();
                Files.copy(coverLetter.getInputStream(), uploadPath.resolve(coverFileName), StandardCopyOption.REPLACE_EXISTING);
                coverFilePath = "/uploads/" + coverFileName;
            }

            return ResponseEntity.ok(new UploadResponse(resumeFilePath, coverFilePath));

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

