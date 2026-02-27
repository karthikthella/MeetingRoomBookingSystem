package com.epam.meetingroom.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BookingRequestDto {
    @NotNull(message = "Room ID is required")
    private Long roomId;

    @NotNull(message = "Date is required")
    @Future(message = "Booking date must be in the future")
    private LocalDate date;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private String agenda;
}
