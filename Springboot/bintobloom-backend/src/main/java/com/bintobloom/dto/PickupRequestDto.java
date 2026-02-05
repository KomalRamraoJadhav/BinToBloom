package com.bintobloom.dto;

import com.bintobloom.entity.PickupRequest;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class PickupRequestDto {
    
    @NotNull(message = "Waste type is required")
    private PickupRequest.WasteType wasteType;
    
    @NotNull(message = "Scheduled date is required")
    @Future(message = "Scheduled date must be in the future")
    private LocalDate scheduledDate;
    
    @NotNull(message = "Scheduled time is required")
    private LocalTime scheduledTime;
    
    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
}