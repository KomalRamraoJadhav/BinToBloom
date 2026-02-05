package com.bintobloom.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "business_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "business_id")
    private Long businessId;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @NotBlank(message = "Business type is required")
    @Size(max = 100, message = "Business type must not exceed 100 characters")
    @Column(name = "business_type", nullable = false, length = 100)
    private String businessType;
    
    @NotNull(message = "Pickup frequency is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "pickup_frequency", nullable = false)
    private PickupFrequency pickupFrequency;
    
    @Column(name = "sustainability_score", precision = 5, scale = 2)
    private BigDecimal sustainabilityScore = BigDecimal.ZERO;
    
    @Column(name = "payment_enabled")
    private Boolean paymentEnabled = false;
    
    @Size(max = 50, message = "License number must not exceed 50 characters")
    @Column(name = "license_number", length = 50)
    private String licenseNumber;
    
    @Column(name = "total_waste_kg", precision = 10, scale = 2)
    private BigDecimal totalWasteKg = BigDecimal.ZERO;
    
    public enum PickupFrequency {
        DAILY, WEEKLY, MONTHLY, ON_DEMAND
    }
}