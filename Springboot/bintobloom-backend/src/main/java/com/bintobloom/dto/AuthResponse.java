package com.bintobloom.dto;

import com.bintobloom.entity.User;
import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long userId;
    private String name;
    private String email;
    private User.UserRole role;
    private String message;
    
    public AuthResponse(String token, Long userId, String name, String email, User.UserRole role, String message) {
        this.token = token;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.message = message;
    }
}