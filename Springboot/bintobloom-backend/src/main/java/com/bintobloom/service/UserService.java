package com.bintobloom.service;

import com.bintobloom.entity.BusinessDetails;
import com.bintobloom.entity.HouseholdDetails;
import com.bintobloom.entity.User;
import com.bintobloom.repository.BusinessDetailsRepository;
import com.bintobloom.repository.HouseholdDetailsRepository;
import com.bintobloom.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private HouseholdDetailsRepository householdDetailsRepository;
    
    @Autowired
    private BusinessDetailsRepository businessDetailsRepository;
    
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }
    
    public List<User> findCollectorsByCity(String city) {
        return userRepository.findByRoleAndCity(User.UserRole.COLLECTOR, city);
    }
    
    public List<User> findActiveCollectors() {
        return userRepository.findByRoleAndStatus(User.UserRole.COLLECTOR, User.UserStatus.ACTIVE);
    }
    
    public void createHouseholdDetails(User user, Integer familySize) {
        HouseholdDetails householdDetails = new HouseholdDetails();
        householdDetails.setUser(user);
        householdDetails.setFamilySize(familySize);
        householdDetailsRepository.save(householdDetails);
    }
    
    public void createBusinessDetails(User user, String businessType, String licenseNumber) {
        BusinessDetails businessDetails = new BusinessDetails();
        businessDetails.setUser(user);
        businessDetails.setBusinessType(businessType);
        businessDetails.setLicenseNumber(licenseNumber);
        businessDetails.setPickupFrequency(BusinessDetails.PickupFrequency.ON_DEMAND);
        businessDetailsRepository.save(businessDetails);
    }
    
    public User updateUserStatus(Long userId, User.UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(status);
        return userRepository.save(user);
    }
}