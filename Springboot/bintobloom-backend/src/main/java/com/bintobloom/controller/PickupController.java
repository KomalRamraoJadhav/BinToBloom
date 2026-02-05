package com.bintobloom.controller;

import com.bintobloom.dto.PickupRequestDto;
import com.bintobloom.entity.PickupRequest;
import com.bintobloom.service.PickupService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pickup")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PickupController {
    
    @Autowired
    private PickupService pickupService;
    
    @PostMapping("/request")
    @PreAuthorize("hasRole('HOUSEHOLD') or hasRole('BUSINESS')")
    public ResponseEntity<?> createPickupRequest(@Valid @RequestBody PickupRequestDto requestDto) {
        try {
            PickupRequest pickupRequest = pickupService.createPickupRequest(requestDto);
            return ResponseEntity.ok(pickupRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating pickup request: " + e.getMessage());
        }
    }
    
    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('HOUSEHOLD') or hasRole('BUSINESS')")
    public ResponseEntity<List<PickupRequest>> getUserPickupRequests() {
        List<PickupRequest> requests = pickupService.getUserPickupRequests();
        return ResponseEntity.ok(requests);
    }
    
    @GetMapping("/collector-requests")
    @PreAuthorize("hasRole('COLLECTOR')")
    public ResponseEntity<List<PickupRequest>> getCollectorPickupRequests() {
        List<PickupRequest> requests = pickupService.getCollectorPickupRequests();
        return ResponseEntity.ok(requests);
    }
    
    @PutMapping("/{pickupId}/status")
    @PreAuthorize("hasRole('COLLECTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> updatePickupStatus(@PathVariable Long pickupId, 
                                               @RequestParam PickupRequest.PickupStatus status) {
        try {
            PickupRequest updatedRequest = pickupService.updatePickupStatus(pickupId, status);
            return ResponseEntity.ok(updatedRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating pickup status: " + e.getMessage());
        }
    }
}