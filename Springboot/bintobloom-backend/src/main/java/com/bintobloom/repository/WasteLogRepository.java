package com.bintobloom.repository;

import com.bintobloom.entity.WasteLog;
import com.bintobloom.entity.PickupRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WasteLogRepository extends JpaRepository<WasteLog, Long> {
    
    Optional<WasteLog> findByPickupRequest(PickupRequest pickupRequest);
    
    @Query("SELECT wl FROM WasteLog wl WHERE wl.pickupRequest.user.userId = :userId")
    List<WasteLog> findByUserId(Long userId);
    
    @Query("SELECT wl FROM WasteLog wl WHERE wl.collectedAt BETWEEN :startDate AND :endDate")
    List<WasteLog> findByCollectedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT wl FROM WasteLog wl WHERE wl.pickupRequest.user.city = :city")
    List<WasteLog> findByPickupRequestUserCity(String city);
}