package com.bintobloom.repository;

import com.bintobloom.entity.BusinessDetails;
import com.bintobloom.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusinessDetailsRepository extends JpaRepository<BusinessDetails, Long> {
    
    Optional<BusinessDetails> findByUser(User user);
    
    Optional<BusinessDetails> findByUserUserId(Long userId);
    
    @Query("SELECT bd FROM BusinessDetails bd ORDER BY bd.sustainabilityScore DESC")
    List<BusinessDetails> findAllOrderBySustainabilityScoreDesc();
    
    @Query("SELECT bd FROM BusinessDetails bd WHERE bd.user.city = :city ORDER BY bd.sustainabilityScore DESC")
    List<BusinessDetails> findByCityOrderBySustainabilityScoreDesc(String city);
}