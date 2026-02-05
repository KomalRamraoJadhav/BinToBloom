package com.bintobloom.controller;

import com.bintobloom.entity.HouseholdDetails;
import com.bintobloom.entity.BusinessDetails;
import com.bintobloom.service.LeaderboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@CrossOrigin(origins = "*", maxAge = 3600)
public class LeaderboardController {
    
    @Autowired
    private LeaderboardService leaderboardService;
    
    @GetMapping("/household")
    public ResponseEntity<List<HouseholdDetails>> getHouseholdLeaderboard() {
        List<HouseholdDetails> leaderboard = leaderboardService.getHouseholdLeaderboard();
        return ResponseEntity.ok(leaderboard);
    }
    
    @GetMapping("/household/city/{city}")
    public ResponseEntity<List<HouseholdDetails>> getHouseholdLeaderboardByCity(@PathVariable String city) {
        List<HouseholdDetails> leaderboard = leaderboardService.getHouseholdLeaderboardByCity(city);
        return ResponseEntity.ok(leaderboard);
    }
    
    @GetMapping("/business")
    public ResponseEntity<List<BusinessDetails>> getBusinessLeaderboard() {
        List<BusinessDetails> leaderboard = leaderboardService.getBusinessLeaderboard();
        return ResponseEntity.ok(leaderboard);
    }
    
    @GetMapping("/business/city/{city}")
    public ResponseEntity<List<BusinessDetails>> getBusinessLeaderboardByCity(@PathVariable String city) {
        List<BusinessDetails> leaderboard = leaderboardService.getBusinessLeaderboardByCity(city);
        return ResponseEntity.ok(leaderboard);
    }
}