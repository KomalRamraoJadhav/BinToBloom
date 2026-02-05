package com.bintobloom.controller;

import com.bintobloom.entity.PickupRequest;
import com.bintobloom.entity.User;
import com.bintobloom.entity.EcoReward;
import com.bintobloom.entity.BusinessDetails;
import com.bintobloom.entity.WasteLog;
import com.bintobloom.repository.PickupRequestRepository;
import com.bintobloom.repository.UserRepository;
import com.bintobloom.repository.EcoRewardRepository;
import com.bintobloom.repository.BusinessDetailsRepository;
import com.bintobloom.repository.WasteLogRepository;
import com.bintobloom.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/business")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BusinessController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PickupRequestRepository pickupRequestRepository;

    @Autowired
    private EcoRewardRepository ecoRewardRepository;

    @Autowired
    private BusinessDetailsRepository businessDetailsRepository;

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
                    "businessType", user.getBusinessType() != null ? user.getBusinessType() : "",
                    "pickupFrequency", user.getPickupFrequency() != null ? user.getPickupFrequency() : "WEEKLY"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to fetch profile"));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, Object> profileData) {
        try {
            User user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (profileData.get("name") != null)
                user.setName((String) profileData.get("name"));
            if (profileData.get("phone") != null)
                user.setPhone((String) profileData.get("phone"));
            if (profileData.get("address") != null)
                user.setAddress((String) profileData.get("address"));
            if (profileData.get("city") != null)
                user.setCity((String) profileData.get("city"));
            if (profileData.get("businessType") != null)
                user.setBusinessType((String) profileData.get("businessType"));
            if (profileData.get("pickupFrequency") != null)
                user.setPickupFrequency((String) profileData.get("pickupFrequency"));

            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to update profile"));
        }
    }

    @PostMapping("/pickup")
    public ResponseEntity<?> createPickupRequest(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, Object> request) {
        try {
            System.out.println("Received pickup request: " + request);

            if (userPrincipal == null) {
                System.out.println("User not authenticated");
                return ResponseEntity.status(401).body(Map.of("message", "User not authenticated"));
            }

            User user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            System.out.println("User found: " + user.getName());

            PickupRequest pickup = new PickupRequest();
            pickup.setUser(user);

            // Parse waste type
            String wasteTypeStr = (String) request.get("wasteType");
            System.out.println("Waste type: " + wasteTypeStr);
            pickup.setWasteType(PickupRequest.WasteType.valueOf(wasteTypeStr));

            // Parse dates
            String dateStr = (String) request.get("scheduledDate");
            String timeStr = (String) request.get("scheduledTime");
            System.out.println("Date: " + dateStr + ", Time: " + timeStr);
            pickup.setScheduledDate(LocalDate.parse(dateStr));
            pickup.setScheduledTime(LocalTime.parse(timeStr));

            pickup.setNotes(request.get("notes") != null ? (String) request.get("notes") : "");
            pickup.setPickupStatus(PickupRequest.PickupStatus.PENDING);

            if (request.get("pickupFrequency") != null) {
                pickup.setPickupFrequency((String) request.get("pickupFrequency"));
            }

            if (request.get("latitude") != null) {
                pickup.setLatitude(new BigDecimal(request.get("latitude").toString()));
            }
            if (request.get("longitude") != null) {
                pickup.setLongitude(new BigDecimal(request.get("longitude").toString()));
            }

            System.out.println("Saving pickup request...");
            PickupRequest savedPickup = pickupRequestRepository.save(pickup);
            System.out.println("Pickup saved with ID: " + savedPickup.getPickupId());

            return ResponseEntity
                    .ok(Map.of("message", "Bulk pickup scheduled successfully", "pickupId", savedPickup.getPickupId()));
        } catch (Exception e) {
            System.err.println("Error creating pickup request: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to schedule pickup: " + e.getMessage()));
        }
    }

    @GetMapping("/pickups")
    public ResponseEntity<?> getMyPickups(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            List<PickupRequest> pickups = pickupRequestRepository
                    .findByUserUserIdOrderByCreatedAtDesc(userPrincipal.getId());
            return ResponseEntity.ok(pickups);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }

    @PutMapping("/pickup/{pickupId}")
    public ResponseEntity<?> updatePickupRequest(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long pickupId,
            @RequestBody Map<String, Object> request) {
        try {
            PickupRequest pickup = pickupRequestRepository.findById(pickupId)
                    .orElseThrow(() -> new RuntimeException("Pickup not found"));

            if (!pickup.getUser().getUserId().equals(userPrincipal.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
            }

            if (!canModifyPickup(pickup)) {
                return ResponseEntity.badRequest().body(Map.of("message",
                        "Cannot modify pickup - either completed or within 2 hours of scheduled time"));
            }

            pickup.setWasteType(PickupRequest.WasteType.valueOf((String) request.get("wasteType")));
            pickup.setScheduledDate(LocalDate.parse((String) request.get("scheduledDate")));
            pickup.setScheduledTime(LocalTime.parse((String) request.get("scheduledTime")));
            pickup.setNotes(request.get("notes") != null ? (String) request.get("notes") : "");

            if (request.get("pickupFrequency") != null) {
                pickup.setPickupFrequency((String) request.get("pickupFrequency"));
            }

            pickupRequestRepository.save(pickup);

            return ResponseEntity.ok(Map.of("message", "Pickup updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to update pickup: " + e.getMessage()));
        }
    }

    @DeleteMapping("/pickup/{pickupId}")
    public ResponseEntity<?> deletePickupRequest(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long pickupId) {
        try {
            PickupRequest pickup = pickupRequestRepository.findById(pickupId)
                    .orElseThrow(() -> new RuntimeException("Pickup not found"));

            if (!pickup.getUser().getUserId().equals(userPrincipal.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
            }

            if (!canModifyPickup(pickup)) {
                return ResponseEntity.badRequest().body(Map.of("message",
                        "Cannot delete pickup - either completed or within 2 hours of scheduled time"));
            }

            pickupRequestRepository.delete(pickup);

            return ResponseEntity.ok(Map.of("message", "Pickup deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to delete pickup: " + e.getMessage()));
        }
    }

    @GetMapping("/eco-points")
    public ResponseEntity<?> getEcoPoints(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            List<EcoReward> rewards = ecoRewardRepository.findByUserUserIdOrderByEarnedAtDesc(userPrincipal.getId());

            int totalPoints = rewards.stream().mapToInt(EcoReward::getPointsEarned).sum();

            List<WasteLog> userLogs = wasteLogRepository.findByUserId(userPrincipal.getId());
            BigDecimal totalWaste = userLogs.stream()
                    .map(WasteLog::getWeightKg)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            return ResponseEntity.ok(Map.of(
                    "totalPoints", totalPoints,
                    "totalWaste", totalWaste,
                    "recentRewards", rewards.stream().limit(10).toList()));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "totalPoints", 0,
                    "recentRewards", List.of()));
        }
    }

    private boolean canModifyPickup(PickupRequest pickup) {
        if (pickup.getPickupStatus() != PickupRequest.PickupStatus.PENDING) {
            return false;
        }

        LocalDateTime scheduledDateTime = LocalDateTime.of(pickup.getScheduledDate(), pickup.getScheduledTime());
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime twoHoursBefore = scheduledDateTime.minusHours(2);

        return now.isBefore(twoHoursBefore);
    }
}