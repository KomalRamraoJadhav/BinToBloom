package com.bintobloom.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "pickup_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PickupRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pickup_id")
    private Long pickupId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "pickupRequests"})
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collector_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "pickupRequests"})
    private User collector;
    
    @NotNull(message = "Waste type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "waste_type", nullable = false, length = 50)
    private WasteType wasteType;
    
    @NotNull(message = "Scheduled date is required")
    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;
    
    @NotNull(message = "Scheduled time is required")
    @Column(name = "scheduled_time", nullable = false)
    private LocalTime scheduledTime;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "pickup_status", nullable = false, length = 30)
    private PickupStatus pickupStatus = PickupStatus.PENDING;
    
    @Size(max = 500, message = "Notes must not exceed 500 characters")
    @Column(length = 500)
    private String notes;
    
    @Column(name = "pickup_frequency", length = 20)
    private String pickupFrequency;

    @Column(precision = 10, scale = 8)
    private java.math.BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private java.math.BigDecimal longitude;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    public enum WasteType {
        FOOD_WASTE, E_WASTE, PLASTIC, PAPER, METAL, GLASS, MIXED, BIODEGRADABLE, NON_BIODEGRADABLE,
        ORGANIC_WASTE, RECYCLABLE_WASTE, CHEMICAL_WASTE, HAZARDOUS_WASTE, CONSTRUCTION_WASTE, NON_RECYCLABLE_COMMERCIAL
    }
    
    public enum PickupStatus {
        PENDING, ASSIGNED, PAYMENT_PENDING, PAID, IN_PROGRESS, COMPLETED, CANCELLED
    }
}