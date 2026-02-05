package com.bintobloom.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "eco_rewards")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class EcoReward {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reward_id")
    private Long rewardId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_id")
    private PickupRequest pickupRequest;
    
    @Column(name = "points_earned", nullable = false)
    private Integer pointsEarned;
    
    @Column(name = "waste_weight")
    private Double wasteWeight;
    
    @Column(name = "earned_at", nullable = false)
    private LocalDateTime earnedAt;
    
    @Column(name = "reward_type", nullable = false)
    private RewardType rewardType = RewardType.PICKUP_COMPLETED;
    
    public enum RewardType {
        PICKUP_COMPLETED, WEEKLY_GOAL, MONTHLY_GOAL, REFERRAL, BONUS
    }
}