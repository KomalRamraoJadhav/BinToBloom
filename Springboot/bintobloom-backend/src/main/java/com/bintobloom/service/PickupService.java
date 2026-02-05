package com.bintobloom.service;

import com.bintobloom.dto.PickupRequestDto;
import com.bintobloom.entity.PickupRequest;
import com.bintobloom.entity.User;
import com.bintobloom.repository.PickupRequestRepository;
import com.bintobloom.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PickupService {
    
    @Autowired
    private PickupRequestRepository pickupRequestRepository;
    
    @Autowired
    private UserService userService;
    
    public PickupRequest createPickupRequest(PickupRequestDto requestDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userService.findByEmail(userPrincipal.getEmail());
        
        PickupRequest pickupRequest = new PickupRequest();
        pickupRequest.setUser(user);
        pickupRequest.setWasteType(requestDto.getWasteType());
        pickupRequest.setScheduledDate(requestDto.getScheduledDate());
        pickupRequest.setScheduledTime(requestDto.getScheduledTime());
        pickupRequest.setNotes(requestDto.getNotes());
        pickupRequest.setPickupStatus(PickupRequest.PickupStatus.PENDING);
        
        return pickupRequestRepository.save(pickupRequest);
    }
    
    public List<PickupRequest> getUserPickupRequests() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userService.findByEmail(userPrincipal.getEmail());
        
        return pickupRequestRepository.findByUserUserIdOrderByCreatedAtDesc(userPrincipal.getId());
    }
    
    public List<PickupRequest> getCollectorPickupRequests() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User collector = userService.findByEmail(userPrincipal.getEmail());
        
        return pickupRequestRepository.findByCollector(collector);
    }
    
    public PickupRequest assignCollector(Long pickupId, Long collectorId) {
        PickupRequest pickupRequest = pickupRequestRepository.findById(pickupId)
                .orElseThrow(() -> new RuntimeException("Pickup request not found"));
        
        User collector = userService.findByEmail(userService.findByEmail("collector@email.com").getEmail()); // This needs proper implementation
        
        pickupRequest.setCollector(collector);
        pickupRequest.setPickupStatus(PickupRequest.PickupStatus.ASSIGNED);
        
        return pickupRequestRepository.save(pickupRequest);
    }
    
    public PickupRequest updatePickupStatus(Long pickupId, PickupRequest.PickupStatus status) {
        PickupRequest pickupRequest = pickupRequestRepository.findById(pickupId)
                .orElseThrow(() -> new RuntimeException("Pickup request not found"));
        
        pickupRequest.setPickupStatus(status);
        return pickupRequestRepository.save(pickupRequest);
    }
}