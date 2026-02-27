package com.epam.meetingroom.service;

import com.epam.meetingroom.domain.enums.BookingStatus;
import com.epam.meetingroom.dto.BookingRequestDto;
import com.epam.meetingroom.dto.BookingResponseDto;

import java.util.List;

public interface BookingService {
    BookingResponseDto createBooking(BookingRequestDto request, String username);
    BookingResponseDto updateBooking(Long id, BookingRequestDto request, String username);
    void cancelBooking(Long id, String username);
    
    BookingResponseDto approveBooking(Long id);
    BookingResponseDto rejectBooking(Long id);
    
    List<BookingResponseDto> getMyBookings(String username);
    List<BookingResponseDto> filterBookings(BookingStatus status);
    List<BookingResponseDto> getAllBookings();
}
