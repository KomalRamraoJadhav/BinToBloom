package com.bintobloom.controller;

import com.bintobloom.entity.Payment;
import com.bintobloom.entity.User;
import com.bintobloom.entity.PickupRequest;
import com.bintobloom.entity.WasteLog;
import com.bintobloom.entity.EcoReward;
import com.bintobloom.repository.PaymentRepository;
import com.bintobloom.repository.UserRepository;
import com.bintobloom.repository.PickupRequestRepository;
import com.bintobloom.repository.WasteLogRepository;
import com.bintobloom.repository.EcoRewardRepository;
import com.bintobloom.security.UserPrincipal;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PickupRequestRepository pickupRequestRepository;

    @Autowired
    private WasteLogRepository wasteLogRepository;

    @Autowired
    private EcoRewardRepository ecoRewardRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            System.out.println("Payment create-order called by user: "
                    + (userPrincipal != null ? userPrincipal.getEmail() : "null"));
            System.out.println("User role: " + (userPrincipal != null ? userPrincipal.getRole() : "null"));

            if (userPrincipal == null) {
                return ResponseEntity.status(401).body("User not authenticated");
            }

            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", Integer.parseInt(data.get("amount").toString()) * 100); // amount in paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "order_" + System.currentTimeMillis());

            Order order = razorpay.orders.create(orderRequest);

            // Save payment record
            User user = userRepository.findById(userPrincipal.getId()).orElse(null);
            if (user != null) {
                Payment payment = new Payment();
                payment.setUser(user);
                payment.setBusinessId(user.getUserId()); // Set business_id to user_id
                payment.setAmount(Double.parseDouble(data.get("amount").toString()));
                payment.setRazorpayOrderId(order.get("id"));
                payment.setStatus(Payment.PaymentStatus.PENDING);
                paymentRepository.save(payment);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            response.put("keyId", razorpayKeyId);

            return ResponseEntity.ok(response);
        } catch (RazorpayException e) {
            return ResponseEntity.badRequest().body("Error creating order: " + e.getMessage());
        }
    }

    @PostMapping("/pay-bill/{pickupId}")
    public ResponseEntity<?> payBill(@PathVariable Long pickupId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            PickupRequest request = pickupRequestRepository.findById(pickupId)
                    .orElseThrow(() -> new RuntimeException("Request not found"));

            Payment payment = paymentRepository.findByPickupRequest(request);
            if (payment == null) {
                return ResponseEntity.badRequest().body("No bill generated for this request");
            }

            if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
                return ResponseEntity.badRequest().body("Bill already paid");
            }

            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", (int) (payment.getAmount() * 100)); // amount in paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "pickup_" + pickupId + "_" + System.currentTimeMillis());

            Order order = razorpay.orders.create(orderRequest);

            payment.setRazorpayOrderId(order.get("id"));
            paymentRepository.save(payment);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            response.put("keyId", razorpayKeyId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating order: " + e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> data,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            String orderId = data.get("razorpay_order_id");
            String paymentId = data.get("razorpay_payment_id");
            String signature = data.get("razorpay_signature");

            // Update payment status
            Payment payment = paymentRepository.findByRazorpayOrderId(orderId);
            if (payment != null) {
                payment.setRazorpayPaymentId(paymentId);
                payment.setRazorpaySignature(signature);
                payment.setStatus(Payment.PaymentStatus.COMPLETED);
                paymentRepository.save(payment);

                // Update Pickup Request Status to COMPLETED and Award Eco Points
                if (payment.getPickupRequest() != null) {
                    PickupRequest pickup = payment.getPickupRequest();
                    pickup.setPickupStatus(PickupRequest.PickupStatus.COMPLETED);
                    pickupRequestRepository.save(pickup);

                    // Award eco-points based on actual weight from WasteLog
                    Optional<WasteLog> wasteLogOpt = wasteLogRepository.findByPickupRequest(pickup);
                    if (wasteLogOpt.isPresent()) {
                        WasteLog wasteLog = wasteLogOpt.get();
                        double weight = wasteLog.getWeightKg().doubleValue();
                        int points = calculateEcoPoints(pickup.getWasteType(), weight);

                        // Create eco reward
                        EcoReward reward = new EcoReward();
                        reward.setUser(pickup.getUser());
                        reward.setPickupRequest(pickup);
                        reward.setPointsEarned(points);
                        reward.setWasteWeight(weight);
                        reward.setRewardType(EcoReward.RewardType.PICKUP_COMPLETED);
                        reward.setEarnedAt(LocalDateTime.now());
                        ecoRewardRepository.save(reward);
                    }
                }
            }

            return ResponseEntity.ok(Map.of("message", "Payment verified successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Payment verification failed: " + e.getMessage());
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getPaymentHistory(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userRepository.findById(userPrincipal.getId()).orElse(null);
            if (user != null) {
                return ResponseEntity.ok(paymentRepository.findByUserOrderByCreatedAtDesc(user));
            }
            return ResponseEntity.badRequest().body("User not found");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching payment history: " + e.getMessage());
        }
    }

    private int calculateEcoPoints(PickupRequest.WasteType wasteType, double weight) {
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