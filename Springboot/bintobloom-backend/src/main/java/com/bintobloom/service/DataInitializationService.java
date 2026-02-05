package com.bintobloom.service;

import com.bintobloom.entity.User;
import com.bintobloom.entity.HouseholdDetails;
import com.bintobloom.entity.BusinessDetails;
import com.bintobloom.repository.UserRepository;
import com.bintobloom.repository.HouseholdDetailsRepository;
import com.bintobloom.repository.BusinessDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class DataInitializationService implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private HouseholdDetailsRepository householdDetailsRepository;
    
    @Autowired
    private BusinessDetailsRepository businessDetailsRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        System.out.println("DataInitializationService running...");
        System.out.println("Current user count: " + userRepository.count());
        
        // Always check and create admin user if missing
        if (!userRepository.findByEmail("admin@gmail.com").isPresent()) {
            System.out.println("Creating admin user...");
            createAdminUser();
        }
        
        if (userRepository.count() == 0) {
            System.out.println("Creating test users...");
            createTestUsers();
        } else {
            System.out.println("Users already exist, skipping initialization.");
        }
    }
    
    private void createAdminUser() {
        User adminUser = new User();
        adminUser.setName("System Administrator");
        adminUser.setEmail("admin@gmail.com");
        adminUser.setPassword(passwordEncoder.encode("Admin@123"));
        adminUser.setRole(User.UserRole.ADMIN);
        adminUser.setPhone("9999999999");
        adminUser.setAddress("BinToBloom HQ");
        adminUser.setCity("Mumbai");
        adminUser.setStatus(User.UserStatus.ACTIVE);
        userRepository.save(adminUser);
        System.out.println("Admin user created: admin@gmail.com / Admin@123");
    }
    
    private void createTestUsers() {
        // Create Household User
        User householdUser = new User();
        householdUser.setName("John Doe");
        householdUser.setEmail("household@test.com");
        householdUser.setPassword(passwordEncoder.encode("password123"));
        householdUser.setRole(User.UserRole.HOUSEHOLD);
        householdUser.setPhone("1234567890");
        householdUser.setAddress("123 Main St");
        householdUser.setCity("Mumbai");
        householdUser.setStatus(User.UserStatus.ACTIVE);
        User savedHousehold = userRepository.save(householdUser);
        
        HouseholdDetails householdDetails = new HouseholdDetails();
        householdDetails.setUser(savedHousehold);
        householdDetails.setFamilySize(4);
        householdDetailsRepository.save(householdDetails);
        
        // Create Business User
        User businessUser = new User();
        businessUser.setName("Business Owner");
        businessUser.setEmail("business@test.com");
        businessUser.setPassword(passwordEncoder.encode("password123"));
        businessUser.setRole(User.UserRole.BUSINESS);
        businessUser.setPhone("9876543210");
        businessUser.setAddress("456 Business Ave");
        businessUser.setCity("Mumbai");
        businessUser.setStatus(User.UserStatus.ACTIVE);
        User savedBusiness = userRepository.save(businessUser);
        
        BusinessDetails businessDetails = new BusinessDetails();
        businessDetails.setUser(savedBusiness);
        businessDetails.setBusinessType("Restaurant");
        businessDetails.setPickupFrequency(BusinessDetails.PickupFrequency.DAILY);
        businessDetailsRepository.save(businessDetails);
        
        // Create Collector User
        User collectorUser = new User();
        collectorUser.setName("Waste Collector");
        collectorUser.setEmail("collector@test.com");
        collectorUser.setPassword(passwordEncoder.encode("password123"));
        collectorUser.setRole(User.UserRole.COLLECTOR);
        collectorUser.setPhone("5555555555");
        collectorUser.setAddress("789 Collector St");
        collectorUser.setCity("Mumbai");
        collectorUser.setStatus(User.UserStatus.ACTIVE);
        userRepository.save(collectorUser);
        
        // Create NGO User
        User ngoUser = new User();
        ngoUser.setName("Green NGO");
        ngoUser.setEmail("ngo@test.com");
        ngoUser.setPassword(passwordEncoder.encode("password123"));
        ngoUser.setRole(User.UserRole.NGO);
        ngoUser.setPhone("7777777777");
        ngoUser.setAddress("456 NGO Street");
        ngoUser.setCity("Mumbai");
        ngoUser.setOrganizationName("Green Earth NGO");
        ngoUser.setRegistrationNumber("NGO123456");
        ngoUser.setStatus(User.UserStatus.ACTIVE);
        userRepository.save(ngoUser);
        
        System.out.println("Test users created successfully!");
        System.out.println("=== LOGIN CREDENTIALS ===");
        System.out.println("Household: household@test.com / password123");
        System.out.println("Business: business@test.com / password123");
        System.out.println("Collector: collector@test.com / password123");
        System.out.println("NGO: ngo@test.com / password123");
        System.out.println("=========================");
    }
}