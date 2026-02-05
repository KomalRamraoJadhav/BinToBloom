package com.bintobloom.repository;

import com.bintobloom.entity.PickupRequest;
import com.bintobloom.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PickupRequestRepository extends JpaRepository<PickupRequest, Long> {
    
    List<PickupRequest> findByUser(User user);
    
    List<PickupRequest> findByUserUserIdOrderByCreatedAtDesc(Long userId);
    
    List<PickupRequest> findByCollectorUserIdOrderByCreatedAtDesc(Long collectorId);
    
    List<PickupRequest> findByPickupStatusOrderByCreatedAtDesc(PickupRequest.PickupStatus status);
    
    List<PickupRequest> findByCollector(User collector);
    
    List<PickupRequest> findByPickupStatus(PickupRequest.PickupStatus status);
    
    List<PickupRequest> findByUserAndPickupStatus(User user, PickupRequest.PickupStatus status);
    
    List<PickupRequest> findByCollectorAndPickupStatus(User collector, PickupRequest.PickupStatus status);
    
    @Query("SELECT pr FROM PickupRequest pr WHERE pr.scheduledDate = :date AND pr.pickupStatus = :status")
    List<PickupRequest> findByScheduledDateAndStatus(LocalDate date, PickupRequest.PickupStatus status);
    
    @Query("SELECT pr FROM PickupRequest pr WHERE pr.user.city = :city AND pr.pickupStatus = :status")
    List<PickupRequest> findByCityAndStatus(String city, PickupRequest.PickupStatus status);
}