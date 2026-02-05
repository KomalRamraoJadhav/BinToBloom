package com.bintobloom.repository;

import com.bintobloom.entity.HouseholdDetails;
import com.bintobloom.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HouseholdDetailsRepository extends JpaRepository<HouseholdDetails, Long> {
    
    Optional<HouseholdDetails> findByUser(User user);
    
    Optional<HouseholdDetails> findByUserUserId(Long userId);
    
    @Query("SELECT hd FROM HouseholdDetails hd ORDER BY hd.ecoPoints DESC")
    List<HouseholdDetails> findAllOrderByEcoPointsDesc();
    
    @Query("SELECT hd FROM HouseholdDetails hd WHERE hd.user.city = :city ORDER BY hd.ecoPoints DESC")
    List<HouseholdDetails> findByCityOrderByEcoPointsDesc(String city);
}