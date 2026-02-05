package com.bintobloom.controller;

import com.bintobloom.entity.User;
import com.bintobloom.security.UserPrincipal;
import com.bintobloom.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userService.findByEmail(userPrincipal.getEmail());
            
            // Remove password from response
            user.setPassword(null);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching user profile: " + e.getMessage());
        }
    }
    
    @GetMapping("/collectors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getActiveCollectors() {
        List<User> collectors = userService.findActiveCollectors();
        return ResponseEntity.ok(collectors);
    }
    
    @PutMapping("/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long userId, 
                                             @RequestParam User.UserStatus status) {
        try {
            User updatedUser = userService.updateUserStatus(userId, status);
            updatedUser.setPassword(null);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating user status: " + e.getMessage());
        }
    }
}