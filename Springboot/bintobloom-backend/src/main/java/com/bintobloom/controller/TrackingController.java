package com.bintobloom.controller;

import com.bintobloom.entity.PickupRequest;
import com.bintobloom.entity.User;
import com.bintobloom.repository.PickupRequestRepository;
import com.bintobloom.repository.UserRepository;
import com.bintobloom.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tracking")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TrackingController {

    @Autowired
    private PickupRequestRepository pickupRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{pickupId}")
    public ResponseEntity<?> getTrackingInfo(@PathVariable Long pickupId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Optional<PickupRequest> pickupOptional = pickupRequestRepository.findById(pickupId);
            if (pickupOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Pickup not found"));
            }

            PickupRequest pickup = pickupOptional.get();

            // Only the user who requested or the collector assigned can track
            if (!pickup.getUser().getUserId().equals(userPrincipal.getId()) &&
                    (pickup.getCollector() == null
                            || !pickup.getCollector().getUserId().equals(userPrincipal.getId()))) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
            }

            Map<String, Object> trackingInfo = new HashMap<>();
            trackingInfo.put("pickupId", pickup.getPickupId());
            trackingInfo.put("status", pickup.getPickupStatus());
            trackingInfo.put("pickupLocation", Map.of(
                    "lat", pickup.getLatitude() != null ? pickup.getLatitude() : 0,
                    "lng", pickup.getLongitude() != null ? pickup.getLongitude() : 0));

            if (pickup.getCollector() != null) {
                User collector = pickup.getCollector();
                trackingInfo.put("collectorLocation", Map.of(
                        "lat", collector.getLatitude() != null ? collector.getLatitude() : 0,
                        "lng", collector.getLongitude() != null ? collector.getLongitude() : 0));
                trackingInfo.put("collectorName", collector.getName());
                trackingInfo.put("collectorPhone", collector.getPhone());
            }

            return ResponseEntity.ok(trackingInfo);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Failed to get tracking info: " + e.getMessage()));
        }
    }
}
