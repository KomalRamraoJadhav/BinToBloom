package com.bintobloom.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "household_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HouseholdDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "household_id")
    private Long householdId;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;
    
    @Column(name = "total_waste_kg", precision = 10, scale = 2)
    private BigDecimal totalWasteKg = BigDecimal.ZERO;
    
    @Column(name = "eco_points")
    private Integer ecoPoints = 0;
    
    @Column(name = "leaderboard_rank")
    private Integer leaderboardRank;
    
    @Column(name = "family_size")
    private Integer familySize;
}