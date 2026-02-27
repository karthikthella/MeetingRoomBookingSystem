package com.epam.meetingroom.dto;

import com.epam.meetingroom.domain.enums.BookingStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BookingResponseDto {
    private Long id;
    private Long roomId;
    private String roomName;
    private Long userId;
    private String username;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String agenda;
    private BookingStatus status;
    private Long durationMinutes;
}
