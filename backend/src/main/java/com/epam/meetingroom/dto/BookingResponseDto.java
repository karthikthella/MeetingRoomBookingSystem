package com.epam.meetingroom.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import com.epam.meetingroom.entity.enums.BookingStatus;

import java.time.LocalDate;
import java.time.LocalTime;

public record BookingResponseDto(
    Long id,
    Long roomId,
    String roomName,
    Long userId,
    String username,

    @Schema(example = "2026-12-31", type = "string")
    LocalDate date,

    @Schema(example = "09:00:00", type = "string")
    LocalTime startTime,

    @Schema(example = "10:00:00", type = "string")
    LocalTime endTime,

    String agenda,
    BookingStatus status,
    Long durationMinutes
) {}
