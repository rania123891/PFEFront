package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    @Autowired
    private AttachmentService attachmentService;

    @PostMapping("/upload")
    public ResponseEntity<AttachmentDTO> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("projectId") Long projectId) {
        AttachmentDTO attachment = attachmentService.store(file, projectId);
        return ResponseEntity.ok(attachment);
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<List<AttachmentDTO>> getProjectAttachments(@PathVariable Long projectId) {
        List<AttachmentDTO> attachments = attachmentService.getAttachmentsByProject(projectId);
        return ResponseEntity.ok(attachments);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long id) {
        attachmentService.deleteAttachment(id);
        return ResponseEntity.ok().build();
    }
} 