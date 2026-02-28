package com.epam.meetingroom.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record BookingRequestDto(
    @NotNull(message = "Room ID is required")
    Long roomId,

    @NotNull(message = "Date is required")
    @Future(message = "Booking date must be in the future")
    @Schema(example = "2026-12-31", type = "string")
    LocalDate date,

    @NotNull(message = "Start time is required")
    @Schema(example = "09:00:00", type = "string")
    LocalTime startTime,

    @NotNull(message = "End time is required")
    @Schema(example = "10:00:00", type = "string")
    LocalTime endTime,

    String agenda
) {}
