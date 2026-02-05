package com.bintobloom.service;

import com.bintobloom.dto.AuthResponse;
import com.bintobloom.dto.LoginRequest;
import com.bintobloom.dto.RegisterRequest;
import com.bintobloom.entity.BusinessDetails;
import com.bintobloom.entity.HouseholdDetails;
import com.bintobloom.entity.User;
import com.bintobloom.repository.UserRepository;
import com.bintobloom.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    private UserService userService;
    
    public AuthResponse login(LoginRequest loginRequest) {
        System.out.println("Login attempt for email: " + loginRequest.getEmail());
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            System.out.println("Login successful for user: " + user.getName());
            return new AuthResponse(jwt, user.getUserId(), user.getName(), user.getEmail(), user.getRole(), "Login successful");
        } catch (Exception e) {
            System.out.println("Login failed: " + e.getMessage());
            throw new RuntimeException("Invalid credentials");
        }
    }
    
    public AuthResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email is already taken!");
        }
        
        // Create user
        User user = new User();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(registerRequest.getRole());
        user.setPhone(registerRequest.getPhone());
        user.setAddress(registerRequest.getAddress());
        user.setCity(registerRequest.getCity());
        user.setStatus(User.UserStatus.ACTIVE);
        
        User savedUser = userRepository.save(user);
        
        // Create role-specific details
        if (registerRequest.getRole() == User.UserRole.HOUSEHOLD) {
            userService.createHouseholdDetails(savedUser, 1); // Default family size
        } else if (registerRequest.getRole() == User.UserRole.BUSINESS) {
            userService.createBusinessDetails(savedUser, registerRequest.getBusinessType(), registerRequest.getLicenseNumber());
        }
        
        return new AuthResponse(null, savedUser.getUserId(), savedUser.getName(), savedUser.getEmail(), 
                savedUser.getRole(), "User registered successfully");
    }
}