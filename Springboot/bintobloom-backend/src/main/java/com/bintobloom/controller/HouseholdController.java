package com.bintobloom.controller;

import com.bintobloom.entity.PickupRequest;
import com.bintobloom.entity.User;
import com.bintobloom.entity.EcoReward;
import com.bintobloom.entity.HouseholdDetails;
import com.bintobloom.repository.PickupRequestRepository;
import com.bintobloom.repository.UserRepository;
import com.bintobloom.repository.EcoRewardRepository;
import com.bintobloom.repository.HouseholdDetailsRepository;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/household")
@CrossOrigin(origins = "*", maxAge = 3600)
public class HouseholdController {

    @Autowired
    private PickupRequestRepository pickupRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EcoRewardRepository ecoRewardRepository;

    @Autowired
    private HouseholdDetailsRepository householdDetailsRepository;

    @PostMapping("/pickup")
    public ResponseEntity<?> createPickupRequest(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, Object> request) {
        try {
            System.out.println("Received pickup request: " + request);
            System.out.println("User principal: " + (userPrincipal != null ? userPrincipal.getId() : "null"));

            if (userPrincipal == null) {
                return ResponseEntity.status(401).body(Map.of("message", "User not authenticated"));
            }

            User user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            PickupRequest pickup = new PickupRequest();
            pickup.setUser(user);
            pickup.setWasteType(PickupRequest.WasteType.valueOf((String) request.get("wasteType")));
            pickup.setScheduledDate(LocalDate.parse((String) request.get("scheduledDate")));
            pickup.setScheduledTime(LocalTime.parse((String) request.get("scheduledTime")));
            pickup.setNotes(request.get("notes") != null ? (String) request.get("notes") : "");
            pickup.setPickupStatus(PickupRequest.PickupStatus.PENDING);

            if (request.get("latitude") != null) {
                pickup.setLatitude(new BigDecimal(request.get("latitude").toString()));
            }
            if (request.get("longitude") != null) {
                pickup.setLongitude(new BigDecimal(request.get("longitude").toString()));
            }

            PickupRequest savedPickup = pickupRequestRepository.save(pickup);
            System.out.println("Saved pickup with ID: " + savedPickup.getPickupId());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Pickup scheduled successfully");
            response.put("pickupId", savedPickup.getPickupId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error creating pickup: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Failed to schedule pickup: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> profile = new HashMap<>();
            profile.put("name", user.getName());
            profile.put("email", user.getEmail());
            profile.put("phone", user.getPhone());
            profile.put("address", user.getAddress());
            profile.put("city", user.getCity());

            return ResponseEntity.ok(profile);
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

            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to update profile"));
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

    @Autowired
    private WasteLogRepository wasteLogRepository;

    @GetMapping("/eco-points")
    public ResponseEntity<?> getEcoPoints(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            System.out.println("Getting eco points for user: " + userPrincipal.getId());
            List<EcoReward> rewards = ecoRewardRepository.findByUserUserIdOrderByEarnedAtDesc(userPrincipal.getId());

            // Calculate total points dynamically
            int totalPoints = rewards.stream()
                    .mapToInt(reward -> reward.getPointsEarned() != null ? reward.getPointsEarned() : 0).sum();

            // Calculate total waste dynamically
            List<com.bintobloom.entity.WasteLog> userLogs = wasteLogRepository.findByUserId(userPrincipal.getId());
            BigDecimal totalWaste = userLogs.stream()
                    .map(com.bintobloom.entity.WasteLog::getWeightKg)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // SELF-HEALING: Update stored details to fix Leaderboard
            householdDetailsRepository.findByUserUserId(userPrincipal.getId()).ifPresent(details -> {
                boolean needsUpdate = false;
                if (details.getTotalWasteKg().compareTo(totalWaste) != 0) {
                    details.setTotalWasteKg(totalWaste);
                    needsUpdate = true;
                }
                if (details.getEcoPoints() != totalPoints) {
                    details.setEcoPoints(totalPoints);
                    needsUpdate = true;
                }
                if (needsUpdate) {
                    householdDetailsRepository.save(details);
                    System.out.println("Self-healed household details for user " + userPrincipal.getId());
                }
            });

            return ResponseEntity.ok(Map.of(
                    "totalPoints", totalPoints,
                    "totalWaste", totalWaste,
                    "recentRewards", rewards.stream().limit(10).toList()));
        } catch (Exception e) {
            System.err.println("Error getting eco points: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(Map.of(
                    "totalPoints", 0,
                    "totalWaste", BigDecimal.ZERO,
                    "recentRewards", List.of()));
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