package com.bintobloom.controller;

import com.bintobloom.entity.User;
import com.bintobloom.entity.ContactMessage;
import com.bintobloom.entity.PickupRequest;
import com.bintobloom.entity.WasteLog;
import com.bintobloom.repository.UserRepository;
import com.bintobloom.repository.ContactMessageRepository;
import com.bintobloom.repository.PickupRequestRepository;
import com.bintobloom.repository.WasteLogRepository;
import com.bintobloom.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {
    
    @Autowired
    private PickupRequestRepository pickupRequestRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ContactMessageRepository contactMessageRepository;
    
    @Autowired
    private WasteLogRepository wasteLogRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private EmailService emailService;
    
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        try {
            List<User> allUsers = userRepository.findAll();
            List<PickupRequest> allPickups = pickupRequestRepository.findAll();
            List<WasteLog> allWasteLogs = wasteLogRepository.findAll();
            
            System.out.println("=== ADMIN DASHBOARD DEBUG ===");
            System.out.println("Total users: " + allUsers.size());
            System.out.println("Total pickups: " + allPickups.size());
            System.out.println("Total waste logs: " + allWasteLogs.size());
            
            long totalCollectors = allUsers.stream().filter(u -> u.getRole() == User.UserRole.COLLECTOR).count();
            long totalNGOs = allUsers.stream().filter(u -> u.getRole() == User.UserRole.NGO).count();
            long pendingPickups = allPickups.stream().filter(p -> p.getPickupStatus() == PickupRequest.PickupStatus.PENDING).count();
            long completedPickups = allPickups.stream().filter(p -> p.getPickupStatus() == PickupRequest.PickupStatus.COMPLETED).count();
            
            System.out.println("Completed pickups: " + completedPickups);
            
            double totalWasteCollected = 0.0;
            for (WasteLog wl : allWasteLogs) {
                if (wl.getWeightKg() != null) {
                    totalWasteCollected += wl.getWeightKg().doubleValue();
                    System.out.println("WasteLog weight: " + wl.getWeightKg());
                }
            }
            
            System.out.println("Total waste collected: " + totalWasteCollected);
            System.out.println("=== END DEBUG ===");
            
            Map<String, Object> dashboard = new HashMap<>();
            dashboard.put("totalUsers", allUsers.size());
            dashboard.put("totalCollectors", totalCollectors);
            dashboard.put("totalNGOs", totalNGOs);
            dashboard.put("pendingPickups", pendingPickups);
            dashboard.put("completedPickups", completedPickups);
            dashboard.put("totalWasteCollected", totalWasteCollected);
            dashboard.put("wasteLogCount", allWasteLogs.size());
            dashboard.put("pickupCount", allPickups.size());
            
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to fetch dashboard: " + e.getMessage());
        }
    }
    
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to fetch users: " + e.getMessage());
        }
    }
    
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            String status = request.get("status");
            user.setStatus(User.UserStatus.valueOf(status));
            userRepository.save(user);
            
            return ResponseEntity.ok("User status updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update user status: " + e.getMessage());
        }
    }
    
    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin() {
        try {
            if (userRepository.findByEmail("admin@bintobloom.com").isPresent()) {
                return ResponseEntity.ok("Admin user already exists");
            }
            
            User adminUser = new User();
            adminUser.setName("System Administrator");
            adminUser.setEmail("admin@bintobloom.com");
            adminUser.setPassword(passwordEncoder.encode("admin123"));
            adminUser.setRole(User.UserRole.ADMIN);
            adminUser.setPhone("9999999999");
            adminUser.setAddress("BinToBloom HQ");
            adminUser.setCity("Mumbai");
            adminUser.setStatus(User.UserStatus.ACTIVE);
            userRepository.save(adminUser);
            
            return ResponseEntity.ok("Admin user created successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create admin: " + e.getMessage());
        }
    }
    
    @GetMapping("/check-users")
    public ResponseEntity<?> checkUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok("Total users: " + users.size() + 
                                ", Admin exists: " + userRepository.findByEmail("admin@bintobloom.com").isPresent());
    }
    
    @GetMapping("/pickups")
    public ResponseEntity<?> getAllPickups() {
        try {
            List<PickupRequest> pickups = pickupRequestRepository.findAll();
            return ResponseEntity.ok(pickups);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to fetch pickups: " + e.getMessage());
        }
    }
    
    @GetMapping("/messages")
    public ResponseEntity<?> getAllMessages() {
        try {
            List<ContactMessage> messages = contactMessageRepository.findAllByOrderByCreatedAtDesc();
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to fetch messages: " + e.getMessage());
        }
    }
    
    @PostMapping("/messages/{messageId}/reply")
    public ResponseEntity<?> replyToMessage(@PathVariable Long messageId, @RequestBody Map<String, String> request) {
        try {
            ContactMessage message = contactMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
            
            String replyText = request.get("reply");
            emailService.sendReply(message.getEmail(), message.getSubject(), replyText);
            
            message.setStatus(ContactMessage.MessageStatus.REPLIED);
            contactMessageRepository.save(message);
            
            return ResponseEntity.ok("Reply sent successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send reply: " + e.getMessage());
        }
    }
    
    @PutMapping("/messages/{messageId}/status")
    public ResponseEntity<?> updateMessageStatus(@PathVariable Long messageId, @RequestBody Map<String, String> request) {
        try {
            ContactMessage message = contactMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
            
            String status = request.get("status");
            message.setStatus(ContactMessage.MessageStatus.valueOf(status));
            contactMessageRepository.save(message);
            
            return ResponseEntity.ok("Message status updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update message status: " + e.getMessage());
        }
    }
}