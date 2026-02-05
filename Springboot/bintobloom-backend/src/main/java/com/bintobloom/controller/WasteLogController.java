package com.bintobloom.controller;

import com.bintobloom.entity.WasteLog;
import com.bintobloom.entity.PickupRequest;
import com.bintobloom.repository.PickupRequestRepository;
import com.bintobloom.service.WasteLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/waste-log")
@CrossOrigin(origins = "*", maxAge = 3600)
public class WasteLogController {
    
    @Autowired
    private WasteLogService wasteLogService;
    
    @Autowired
    private PickupRequestRepository pickupRequestRepository;
    
    @PostMapping("/create")
    @PreAuthorize("hasRole('COLLECTOR')")
    public ResponseEntity<?> createWasteLog(@RequestParam Long pickupId,
                                           @RequestParam BigDecimal weight,
                                           @RequestParam(required = false) String photoUrl,
                                           @RequestParam(required = false) String notes) {
        try {
            PickupRequest pickupRequest = pickupRequestRepository.findById(pickupId)
                    .orElseThrow(() -> new RuntimeException("Pickup request not found"));
            
            WasteLog wasteLog = wasteLogService.createWasteLog(pickupRequest, weight, photoUrl, notes);
            return ResponseEntity.ok(wasteLog);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating waste log: " + e.getMessage());
        }
    }
    
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('HOUSEHOLD') or hasRole('BUSINESS') or hasRole('ADMIN')")
    public ResponseEntity<List<WasteLog>> getUserWasteLogs(@PathVariable Long userId) {
        List<WasteLog> wasteLogs = wasteLogService.getUserWasteLogs(userId);
        return ResponseEntity.ok(wasteLogs);
    }
}