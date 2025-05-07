package com.example.backend.attachments.commands;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class UploadAttachmentCommand {
    private MultipartFile file;
    private Long projectId;
} 