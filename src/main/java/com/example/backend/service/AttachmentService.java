package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttachmentService {

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public AttachmentDTO store(MultipartFile file, Long projectId) {
        try {
            String fileName = StringUtils.cleanPath(file.getOriginalFilename());
            String uniqueFileName = System.currentTimeMillis() + "_" + fileName;
            Path targetLocation = Paths.get(uploadDir).resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            Attachment attachment = new Attachment();
            attachment.setName(fileName);
            attachment.setPath(uniqueFileName);
            attachment.setProjectId(projectId);
            attachment.setSize(file.getSize());
            attachment.setUploadDate(new Date());

            attachment = attachmentRepository.save(attachment);
            return mapToDTO(attachment);
        } catch (IOException ex) {
            throw new RuntimeException("Impossible de stocker le fichier " + file.getOriginalFilename(), ex);
        }
    }

    public List<AttachmentDTO> getAttachmentsByProject(Long projectId) {
        return attachmentRepository.findByProjectId(projectId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public void deleteAttachment(Long id) {
        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pièce jointe non trouvée"));

        Path filePath = Paths.get(uploadDir).resolve(attachment.getPath());
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la suppression du fichier", e);
        }

        attachmentRepository.delete(attachment);
    }

    private AttachmentDTO mapToDTO(Attachment attachment) {
        AttachmentDTO dto = new AttachmentDTO();
        dto.setId(attachment.getId());
        dto.setName(attachment.getName());
        dto.setSize(attachment.getSize());
        dto.setUploadDate(attachment.getUploadDate());
        return dto;
    }
} 