package com.bintobloom.service;

import com.bintobloom.entity.*;
import com.bintobloom.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class WasteLogService {
    
    @Autowired
    private WasteLogRepository wasteLogRepository;
    
    @Autowired
    private HouseholdDetailsRepository householdDetailsRepository;
    
    @Autowired
    private BusinessDetailsRepository businessDetailsRepository;
    
    @Autowired
    private EcoRewardRepository ecoRewardRepository;
    
    public WasteLog createWasteLog(PickupRequest pickupRequest, BigDecimal weight, String photoUrl, String notes) {
        WasteLog wasteLog = new WasteLog();
        wasteLog.setPickupRequest(pickupRequest);
        wasteLog.setWasteType(pickupRequest.getWasteType());
        wasteLog.setWeightKg(weight);
        wasteLog.setPhotoUrl(photoUrl);
        wasteLog.setNotes(notes);
        
        WasteLog savedLog = wasteLogRepository.save(wasteLog);
        
        // Update user totals and award points
        updateUserWasteTotal(pickupRequest.getUser(), weight);
        awardEcoPoints(pickupRequest.getUser(), weight);
        
        return savedLog;
    }
    
    private void updateUserWasteTotal(User user, BigDecimal weight) {
        if (user.getRole() == User.UserRole.HOUSEHOLD) {
            householdDetailsRepository.findByUser(user).ifPresent(details -> {
                details.setTotalWasteKg(details.getTotalWasteKg().add(weight));
                householdDetailsRepository.save(details);
            });
        } else if (user.getRole() == User.UserRole.BUSINESS) {
            businessDetailsRepository.findByUser(user).ifPresent(details -> {
                details.setTotalWasteKg(details.getTotalWasteKg().add(weight));
                businessDetailsRepository.save(details);
            });
        }
    }
    
    private void awardEcoPoints(User user, BigDecimal weight) {
        if (user.getRole() == User.UserRole.HOUSEHOLD) {
            int points = weight.intValue() * 10; // 10 points per kg
            
            EcoReward reward = new EcoReward();
            reward.setUser(user);
            reward.setPointsEarned(points);
            reward.setRewardType(EcoReward.RewardType.PICKUP_COMPLETED);
            ecoRewardRepository.save(reward);
            
            // Update household eco points
            householdDetailsRepository.findByUser(user).ifPresent(details -> {
                details.setEcoPoints(details.getEcoPoints() + points);
                householdDetailsRepository.save(details);
            });
        }
    }
    
    public List<WasteLog> getUserWasteLogs(Long userId) {
        return wasteLogRepository.findByUserId(userId);
    }
}