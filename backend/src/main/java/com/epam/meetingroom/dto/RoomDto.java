package com.epam.meetingroom.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RoomDto(
    Long id,

    @NotBlank(message = "Room name is required")
    String name,

    @NotNull(message = "Room capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    Integer capacity,

    @NotNull(message = "Floor number is required")
    Integer floorNumber
) {}
