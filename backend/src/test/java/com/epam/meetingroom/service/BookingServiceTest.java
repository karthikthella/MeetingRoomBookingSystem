package com.epam.meetingroom.service;

import com.epam.meetingroom.entity.enums.BookingStatus;
import com.epam.meetingroom.entity.Booking;
import com.epam.meetingroom.entity.Room;
import com.epam.meetingroom.entity.User;
import com.epam.meetingroom.dto.BookingRequestDto;
import com.epam.meetingroom.dto.BookingResponseDto;
import com.epam.meetingroom.mapper.BookingMapper;
import com.epam.meetingroom.repository.BookingRepository;
import com.epam.meetingroom.repository.RoomRepository;
import com.epam.meetingroom.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private RoomRepository roomRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private BookingMapper bookingMapper;

    @InjectMocks
    private BookingService bookingService;

    private User user;
    private Room room;
    private BookingRequestDto request;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).username("testuser").build();
        room = Room.builder().id(1L).name("Conference Room").build();
        
        request = new BookingRequestDto(
            1L,
            LocalDate.now().plusDays(1),
            LocalTime.of(10, 0),
            LocalTime.of(11, 0),
            "Test Agenda"
        );
    }

    @Test
    void testCreateBooking_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArguments()[0]);
        // BookingResponseDto is also a record now
        BookingResponseDto response = new BookingResponseDto(1L, 1L, "Room", 1L, "user", LocalDate.now(), LocalTime.now(), LocalTime.now().plusHours(1), "Agenda", BookingStatus.PENDING, 60L);
        when(bookingMapper.toDto(any(Booking.class))).thenReturn(response);

        BookingResponseDto result = bookingService.createBooking(request, "testuser");

        assertNotNull(result);
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    void testCreateBooking_DurationTooShort() {
        BookingRequestDto shortRequest = new BookingRequestDto(
            1L,
            LocalDate.now().plusDays(1),
            LocalTime.of(10, 0),
            LocalTime.of(10, 5),
            "Test Agenda"
        );
        
        assertThrows(RuntimeException.class, () -> bookingService.createBooking(shortRequest, "testuser"));
    }

    @Test
    void testCreateBooking_PastDate() {
        BookingRequestDto pastRequest = new BookingRequestDto(
            1L,
            LocalDate.now().minusDays(1),
            LocalTime.of(10, 0),
            LocalTime.of(11, 0),
            "Test Agenda"
        );
        
        assertThrows(RuntimeException.class, () -> bookingService.createBooking(pastRequest, "testuser"));
    }

    @Test
    void testApproveBooking_OverlapConflict() {
        Booking booking = Booking.builder()
                .id(1L)
                .room(room)
                .date(request.date())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .status(BookingStatus.PENDING)
                .build();

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.existsOverlappingApprovedBooking(any(), any(), any(), any(), any()))
                .thenReturn(true);

        assertThrows(RuntimeException.class, () -> bookingService.approveBooking(1L));
    }
}
