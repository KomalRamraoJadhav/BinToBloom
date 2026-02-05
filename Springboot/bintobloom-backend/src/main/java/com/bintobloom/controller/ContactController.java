package com.bintobloom.controller;

import com.bintobloom.entity.ContactMessage;
import com.bintobloom.repository.ContactMessageRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ContactController {
    
    @Autowired
    private ContactMessageRepository contactMessageRepository;
    
    @PostMapping("/submit")
    public ResponseEntity<?> submitContactForm(@Valid @RequestBody ContactMessage contactMessage) {
        try {
            contactMessage.setStatus(ContactMessage.MessageStatus.UNREAD);
            ContactMessage savedMessage = contactMessageRepository.save(contactMessage);
            return ResponseEntity.ok("Message sent successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send message: " + e.getMessage());
        }
    }
}