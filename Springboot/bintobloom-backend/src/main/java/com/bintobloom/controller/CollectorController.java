package com.bintobloom.controller;

import com.bintobloom.entity.PickupRequest;
import com.bintobloom.entity.User;
import com.bintobloom.entity.WasteLog;
import com.bintobloom.entity.EcoReward;
import com.bintobloom.entity.Payment;
import com.bintobloom.repository.PickupRequestRepository;
import com.bintobloom.repository.UserRepository;
import com.bintobloom.repository.WasteLogRepository;
import com.bintobloom.repository.EcoRewardRepository;
import com.bintobloom.repository.HouseholdDetailsRepository;
import com.bintobloom.repository.BusinessDetailsRepository;
import com.bintobloom.repository.PaymentRepository;
import com.bintobloom.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/collector")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CollectorController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PickupRequestRepository pickupRequestRepository;

    @Autowired
    private WasteLogRepository wasteLogRepository;

    @Autowired
    private EcoRewardRepository ecoRewardRepository;

    @Autowired
    private HouseholdDetailsRepository householdDetailsRepository;

    @Autowired
    private BusinessDetailsRepository businessDetailsRepository;

    @Autowired
    private PaymentRepository paymentRepository;

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
                    "vehicleType", user.getVehicleType() != null ? user.getVehicleType() : "",
                    "licenseNumber", user.getLicenseNumber() != null ? user.getLicenseNumber() : ""));
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
            if (profileData.get("vehicleType") != null)
                user.setVehicleType((String) profileData.get("vehicleType"));
            if (profileData.get("licenseNumber") != null)
                user.setLicenseNumber((String) profileData.get("licenseNumber"));

            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to update profile"));
        }
    }

    @GetMapping("/requests")
    public ResponseEntity<?> getAllRequests(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            List<PickupRequest> requests = pickupRequestRepository
                    .findByPickupStatusOrderByCreatedAtDesc(PickupRequest.PickupStatus.PENDING);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/my-requests")
    public ResponseEntity<?> getMyRequests(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            List<PickupRequest> requests = pickupRequestRepository
                    .findByCollectorUserIdOrderByCreatedAtDesc(userPrincipal.getId());
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }

    @PutMapping("/requests/{requestId}/accept")
    public ResponseEntity<?> acceptRequest(@PathVariable Long requestId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            PickupRequest request = pickupRequestRepository.findById(requestId)
                    .orElseThrow(() -> new RuntimeException("Request not found"));

            if (request.getPickupStatus() != PickupRequest.PickupStatus.PENDING) {
                return ResponseEntity.badRequest().body(Map.of("message", "Request is no longer available"));
            }

            User collector = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new RuntimeException("Collector not found"));

            request.setCollector(collector);
            request.setPickupStatus(PickupRequest.PickupStatus.ASSIGNED);
            pickupRequestRepository.save(request);

            return ResponseEntity.ok(Map.of("message", "Request accepted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to accept request: " + e.getMessage()));
        }
    }

    @PutMapping("/requests/{requestId}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long requestId) {
        try {
            PickupRequest request = pickupRequestRepository.findById(requestId)
                    .orElseThrow(() -> new RuntimeException("Request not found"));

            request.setPickupStatus(PickupRequest.PickupStatus.CANCELLED);
            pickupRequestRepository.save(request);

            return ResponseEntity.ok(Map.of("message", "Request rejected successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to reject request: " + e.getMessage()));
        }
    }

    @PostMapping("/requests/{requestId}/generate-bill")
    public ResponseEntity<?> generateBill(@PathVariable Long requestId, @RequestBody Map<String, Object> billData,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            PickupRequest request = pickupRequestRepository.findById(requestId)
                    .orElseThrow(() -> new RuntimeException("Request not found"));

            // Check authorization
            if (request.getCollector() == null || !request.getCollector().getUserId().equals(userPrincipal.getId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "You are not assigned to this request"));
            }

            if (request.getPickupStatus() != PickupRequest.PickupStatus.ASSIGNED) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Request status must be ASSIGNED to generate bill"));
            }

            Double amount = Double.parseDouble(billData.get("amount").toString());
            Double weight = Double.parseDouble(billData.get("weight").toString());

            if (amount <= 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "Amount must be greater than 0"));
            }

            if (weight <= 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "Weight must be greater than 0"));
            }

            // Create WasteLog to store weight for later eco-points calculation
            WasteLog wasteLog = new WasteLog();
            wasteLog.setPickupRequest(request);
            wasteLog.setWasteType(request.getWasteType());
            wasteLog.setWeightKg(BigDecimal.valueOf(weight));
            wasteLog.setNotes(billData.get("notes") != null ? billData.get("notes").toString() : "");
            wasteLog.setCollectedAt(LocalDateTime.now());
            wasteLogRepository.save(wasteLog);

            // Check if payment already exists
            Payment existingPayment = paymentRepository.findByPickupRequest(request);
            if (existingPayment != null) {
                existingPayment.setAmount(amount);
                paymentRepository.save(existingPayment);

                request.setPickupStatus(PickupRequest.PickupStatus.PAYMENT_PENDING);
                pickupRequestRepository.save(request);

                return ResponseEntity.ok(
                        Map.of("message", "Bill updated successfully", "paymentId", existingPayment.getPaymentId()));
            }

            // Create Payment
            Payment payment = new Payment();
            payment.setUser(request.getUser());
            payment.setPickupRequest(request);
            payment.setAmount(amount);
            payment.setStatus(Payment.PaymentStatus.PENDING);
            paymentRepository.save(payment);

            // Update Pickup Status
            request.setPickupStatus(PickupRequest.PickupStatus.PAYMENT_PENDING);
            pickupRequestRepository.save(request);

            return ResponseEntity
                    .ok(Map.of("message", "Bill generated successfully", "paymentId", payment.getPaymentId()));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to generate bill: " + e.getMessage()));
        }
    }

    @PostMapping("/test-create-reward")
    public ResponseEntity<?> testCreateReward(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            EcoReward testReward = new EcoReward();
            testReward.setUser(user);
            testReward.setPointsEarned(10);
            testReward.setEarnedAt(LocalDateTime.now());
            testReward.setRewardType(EcoReward.RewardType.PICKUP_COMPLETED);

            EcoReward saved = ecoRewardRepository.save(testReward);

            return ResponseEntity.ok(Map.of(
                    "message", "Test reward created",
                    "rewardId", saved.getRewardId(),
                    "points", saved.getPointsEarned()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/requests/{requestId}/complete")
    public ResponseEntity<?> completeRequest(@PathVariable Long requestId,
            @RequestBody Map<String, Object> completionData, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            PickupRequest request = pickupRequestRepository.findById(requestId)
                    .orElseThrow(() -> new RuntimeException("Request not found"));

            // Verify the collector is assigned to this request
            if (request.getCollector() == null || !request.getCollector().getUserId().equals(userPrincipal.getId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "You are not assigned to this request"));
            }

            User customer = request.getUser();
            WasteLog wasteLog = null;
            double weight = 0.0;

            if (customer.getRole() == User.UserRole.HOUSEHOLD) {
                // Household flow: No payment required, allow from ASSIGNED
                if (request.getPickupStatus() != PickupRequest.PickupStatus.ASSIGNED) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Request must be in ASSIGNED status to complete (Household)"));
                }

                // Create new WasteLog from input
                if (completionData.get("weight") == null) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Weight is required for completion"));
                }
                weight = Double.parseDouble(completionData.get("weight").toString());

                wasteLog = new WasteLog();
                wasteLog.setPickupRequest(request);
                wasteLog.setWasteType(request.getWasteType());
                wasteLog.setWeightKg(BigDecimal.valueOf(weight));
                wasteLog.setNotes(completionData.get("notes") != null ? completionData.get("notes").toString() : "");
                wasteLog.setCollectedAt(LocalDateTime.now());
                wasteLogRepository.save(wasteLog);

            } else if (customer.getRole() == User.UserRole.BUSINESS) {
                // Business flow: Payment required
                if (request.getPickupStatus() != PickupRequest.PickupStatus.PAID) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Payment must be completed before marking as complete (Business)"));
                }
                // Get weight from existing WasteLog
                Optional<WasteLog> wasteLogOpt = wasteLogRepository.findByPickupRequest(request);
                if (!wasteLogOpt.isPresent()) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "No weight data found. Please generate bill first."));
                }
                wasteLog = wasteLogOpt.get();
                weight = wasteLog.getWeightKg().doubleValue();

                // Update notes if provided
                String notes = (String) completionData.get("notes");
                if (notes != null) {
                    wasteLog.setNotes(notes);
                    wasteLogRepository.save(wasteLog);
                }
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Unsupported user role"));
            }

            // Calculate formatted points
            int pointsEarned = calculatePoints(request.getWasteType(), weight);

            final double finalWeight = weight;

            // Update User Statistics (Total Waste and Points)
            if (customer.getRole() == User.UserRole.HOUSEHOLD) {
                householdDetailsRepository.findByUser(customer).ifPresent(details -> {
                    details.setTotalWasteKg(details.getTotalWasteKg().add(BigDecimal.valueOf(finalWeight)));
                    details.setEcoPoints(details.getEcoPoints() + pointsEarned);
                    householdDetailsRepository.save(details);
                });
            } else if (customer.getRole() == User.UserRole.BUSINESS) {
                businessDetailsRepository.findByUser(customer).ifPresent(details -> {
                    details.setTotalWasteKg(details.getTotalWasteKg().add(BigDecimal.valueOf(finalWeight)));
                    businessDetailsRepository.save(details);
                });
            }

            // Award EcoPoints
            EcoReward reward = new EcoReward();
            reward.setUser(customer);
            reward.setPointsEarned(pointsEarned);
            reward.setEarnedAt(LocalDateTime.now());
            reward.setRewardType(EcoReward.RewardType.PICKUP_COMPLETED);
            ecoRewardRepository.save(reward);

            // Update Request Status
            request.setPickupStatus(PickupRequest.PickupStatus.COMPLETED);
            pickupRequestRepository.save(request);

            return ResponseEntity.ok(Map.of(
                    "message", "Pickup completed successfully",
                    "weight", weight,
                    "pointsAwarded", pointsEarned));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to complete pickup: " + e.getMessage()));
        }
    }

    @PutMapping("/location")
    public ResponseEntity<?> updateLocation(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, BigDecimal> locationData) {
        try {
            User collector = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new RuntimeException("Collector not found"));

            BigDecimal latitude = locationData.get("latitude");
            BigDecimal longitude = locationData.get("longitude");

            if (latitude == null || longitude == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Latitude and longitude are required"));
            }

            collector.setLatitude(latitude);
            collector.setLongitude(longitude);
            userRepository.save(collector);

            return ResponseEntity.ok(Map.of("message", "Location updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to update location: " + e.getMessage()));
        }
    }

    int calculatePoints(PickupRequest.WasteType wasteType, double weight) {
        double ecoFactor = switch (wasteType) {
            case BIODEGRADABLE -> 1.0;
            case NON_BIODEGRADABLE -> 0.5;
            case ORGANIC_WASTE -> 1.0;
            case RECYCLABLE_WASTE -> 1.5;
            case E_WASTE -> 2.0;
            case CHEMICAL_WASTE -> 2.5;
            case HAZARDOUS_WASTE -> 3.0;
            case CONSTRUCTION_WASTE -> 1.8;
            case NON_RECYCLABLE_COMMERCIAL -> 0.8;
            default -> 1.0;
        };
        return (int) Math.round(weight * ecoFactor);
    }
}