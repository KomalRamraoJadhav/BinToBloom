package com.bintobloom.service;

import com.bintobloom.entity.HouseholdDetails;
import com.bintobloom.entity.BusinessDetails;
import com.bintobloom.repository.HouseholdDetailsRepository;
import com.bintobloom.repository.BusinessDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LeaderboardService {
    
    @Autowired
    private HouseholdDetailsRepository householdDetailsRepository;
    
    @Autowired
    private BusinessDetailsRepository businessDetailsRepository;
    
    public List<HouseholdDetails> getHouseholdLeaderboard() {
        return householdDetailsRepository.findAllOrderByEcoPointsDesc();
    }
    
    public List<HouseholdDetails> getHouseholdLeaderboardByCity(String city) {
        return householdDetailsRepository.findByCityOrderByEcoPointsDesc(city);
    }
    
    public List<BusinessDetails> getBusinessLeaderboard() {
        return businessDetailsRepository.findAllOrderBySustainabilityScoreDesc();
    }
    
    public List<BusinessDetails> getBusinessLeaderboardByCity(String city) {
        return businessDetailsRepository.findByCityOrderBySustainabilityScoreDesc(city);
    }
}