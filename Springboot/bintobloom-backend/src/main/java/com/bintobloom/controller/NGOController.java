package com.bintobloom.controller;

import com.bintobloom.entity.PickupRequest;
import com.bintobloom.entity.User;
import com.bintobloom.entity.WasteLog;
import com.bintobloom.repository.PickupRequestRepository;
import com.bintobloom.repository.UserRepository;
import com.bintobloom.repository.WasteLogRepository;
import com.bintobloom.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ngo")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NGOController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PickupRequestRepository pickupRequestRepository;
    
    @Autowired
    private WasteLogRepository wasteLogRepository;
    
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            return ResponseEntity.ok(Map.of(
                "name", user.getName(),
                "email", user.getEmail(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "address", user.getAddress() != null ? user.getAddress() : "",
                "city", user.getCity() != null ? user.getCity() : "",
                "organizationName", user.getOrganizationName() != null ? user.getOrganizationName() : "",
                "registrationNumber", user.getRegistrationNumber() != null ? user.getRegistrationNumber() : ""
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to fetch profile"));
        }
    }
    
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserPrincipal userPrincipal, @RequestBody Map<String, Object> profileData) {
        try {
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (profileData.get("name") != null) user.setName((String) profileData.get("name"));
            if (profileData.get("phone") != null) user.setPhone((String) profileData.get("phone"));
            if (profileData.get("address") != null) user.setAddress((String) profileData.get("address"));
            if (profileData.get("city") != null) user.setCity((String) profileData.get("city"));
            if (profileData.get("organizationName") != null) user.setOrganizationName((String) profileData.get("organizationName"));
            if (profileData.get("registrationNumber") != null) user.setRegistrationNumber((String) profileData.get("registrationNumber"));
            
            userRepository.save(user);
            
            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to update profile"));
        }
    }
    
    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics() {
        try {
            List<WasteLog> wasteLogs = wasteLogRepository.findAll();
            List<PickupRequest> pickupRequests = pickupRequestRepository.findAll();
            
            // Calculate total waste collected
            BigDecimal totalWaste = wasteLogs.stream()
                .map(WasteLog::getWeightKg)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Calculate waste by type
            Map<String, BigDecimal> wasteByType = wasteLogs.stream()
                .collect(Collectors.groupingBy(
                    log -> log.getWasteType().toString(),
                    Collectors.reducing(BigDecimal.ZERO, WasteLog::getWeightKg, BigDecimal::add)
                ));
            
            // Calculate city-wise data
            Map<String, Long> cityWisePickups = pickupRequests.stream()
                .filter(req -> req.getPickupStatus() == PickupRequest.PickupStatus.COMPLETED)
                .collect(Collectors.groupingBy(
                    req -> req.getUser().getCity(),
                    Collectors.counting()
                ));
            
            Map<String, BigDecimal> cityWiseWaste = wasteLogs.stream()
                .collect(Collectors.groupingBy(
                    log -> log.getPickupRequest().getUser().getCity(),
                    Collectors.reducing(BigDecimal.ZERO, WasteLog::getWeightKg, BigDecimal::add)
                ));
            
            return ResponseEntity.ok(Map.of(
                "totalWaste", totalWaste,
                "totalPickups", pickupRequests.size(),
                "completedPickups", pickupRequests.stream().mapToLong(req -> req.getPickupStatus() == PickupRequest.PickupStatus.COMPLETED ? 1 : 0).sum(),
                "wasteByType", wasteByType,
                "cityWisePickups", cityWisePickups,
                "cityWiseWaste", cityWiseWaste
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to fetch analytics"));
        }
    }
    
    @GetMapping("/analytics/city/{city}")
    public ResponseEntity<?> getCityAnalytics(@PathVariable String city) {
        try {
            List<PickupRequest> cityPickups = pickupRequestRepository.findByCityAndStatus(city, PickupRequest.PickupStatus.COMPLETED);
            List<WasteLog> cityWasteLogs = wasteLogRepository.findByPickupRequestUserCity(city);
            
            BigDecimal totalWaste = cityWasteLogs.stream()
                .map(WasteLog::getWeightKg)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            Map<String, BigDecimal> wasteByType = cityWasteLogs.stream()
                .collect(Collectors.groupingBy(
                    log -> log.getWasteType().toString(),
                    Collectors.reducing(BigDecimal.ZERO, WasteLog::getWeightKg, BigDecimal::add)
                ));
            
            return ResponseEntity.ok(Map.of(
                "city", city,
                "totalWaste", totalWaste,
                "totalPickups", cityPickups.size(),
                "wasteByType", wasteByType
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to fetch city analytics"));
        }
    }
}