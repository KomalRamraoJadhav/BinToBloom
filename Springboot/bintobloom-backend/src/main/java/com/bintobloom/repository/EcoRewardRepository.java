package com.bintobloom.repository;

import com.bintobloom.entity.EcoReward;
import com.bintobloom.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EcoRewardRepository extends JpaRepository<EcoReward, Long> {
    
    List<EcoReward> findByUser(User user);
    
    @Query("SELECT SUM(er.pointsEarned) FROM EcoReward er WHERE er.user = :user")
    Integer getTotalPointsByUser(User user);
    
    @Query("SELECT er FROM EcoReward er WHERE er.user = :user ORDER BY er.earnedAt DESC")
    List<EcoReward> findByUserOrderByEarnedAtDesc(User user);
    
    List<EcoReward> findByUserUserIdOrderByEarnedAtDesc(Long userId);
    
    // Add flush method for immediate database persistence
    default void flush() {
        // This will be implemented by Spring Data JPA
    }
}