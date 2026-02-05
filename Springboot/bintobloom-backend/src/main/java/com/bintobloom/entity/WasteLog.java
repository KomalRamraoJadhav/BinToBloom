package com.bintobloom.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "waste_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class WasteLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_id", nullable = false)
    private PickupRequest pickupRequest;
    
    @NotNull(message = "Waste type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "waste_type", nullable = false, length = 100)
    private PickupRequest.WasteType wasteType;
    
    @NotNull(message = "Weight is required")
    @DecimalMin(value = "0.1", message = "Weight must be at least 0.1 kg")
    @DecimalMax(value = "1000.0", message = "Weight must not exceed 1000 kg")
    @Column(name = "weight_kg", nullable = false, precision = 8, scale = 2)
    private BigDecimal weightKg;
    
    @Column(name = "photo_url", length = 500)
    private String photoUrl;
    
    @Size(max = 500, message = "Notes must not exceed 500 characters")
    @Column(length = 500)
    private String notes;
    
    @CreatedDate
    @Column(name = "collected_at", nullable = false, updatable = false)
    private LocalDateTime collectedAt;
}