package com.job_tracker.job.tracker;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.Optional;

@Service
public class ImageService {

    private final ImageRepository imageRepository;

    @Value("${upload.dir}")
    private String uploadDir;

    public ImageService(ImageRepository imageRepository) {
        this.imageRepository = imageRepository;
    }

    // === Save image to disk and database ===
    public Image saveImage(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Unique filename to avoid conflicts
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);

        // Save file to disk
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Save metadata to database
        Image image = new Image();
        image.setName(fileName);
        image.setType(file.getContentType());
        image.setPath(filePath.toString());

        return imageRepository.save(image);
    }

    // === Delete image (from DB + disk) ===
    public boolean deleteImage(Long id) {
        Optional<Image> imageOpt = imageRepository.findById(id);
        if (imageOpt.isEmpty()) return false;

        Image image = imageOpt.get();
        try {
            Files.deleteIfExists(Paths.get(image.getPath()));
        } catch (IOException e) {
            e.printStackTrace();
        }
        imageRepository.deleteById(id);
        return true;
    }
}
