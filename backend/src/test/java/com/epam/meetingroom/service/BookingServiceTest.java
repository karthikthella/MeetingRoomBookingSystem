package com.epam.meetingroom.service;

import com.epam.meetingroom.domain.enums.BookingStatus;
import com.epam.meetingroom.domain.model.Booking;
import com.epam.meetingroom.domain.model.Room;
import com.epam.meetingroom.domain.model.User;
import com.epam.meetingroom.dto.BookingRequestDto;
import com.epam.meetingroom.dto.BookingResponseDto;
import com.epam.meetingroom.mapper.BookingMapper;
import com.epam.meetingroom.repository.BookingRepository;
import com.epam.meetingroom.repository.RoomRepository;
import com.epam.meetingroom.repository.UserRepository;
import com.epam.meetingroom.service.impl.BookingServiceImpl;
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
    private BookingServiceImpl bookingService;

    private User user;
    private Room room;
    private BookingRequestDto request;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).username("testuser").build();
        room = Room.builder().id(1L).name("Conference Room").build();
        
        request = new BookingRequestDto();
        request.setRoomId(1L);
        request.setDate(LocalDate.now().plusDays(1));
        request.setStartTime(LocalTime.of(10, 0));
        request.setEndTime(LocalTime.of(11, 0));
        request.setAgenda("Test Agenda");
    }

    @Test
    void testCreateBooking_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArguments()[0]);
        when(bookingMapper.toDto(any(Booking.class))).thenReturn(new BookingResponseDto());

        BookingResponseDto result = bookingService.createBooking(request, "testuser");

        assertNotNull(result);
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    void testCreateBooking_DurationTooShort() {
        request.setEndTime(request.getStartTime().plusMinutes(5));
        
        assertThrows(RuntimeException.class, () -> bookingService.createBooking(request, "testuser"));
    }

    @Test
    void testCreateBooking_PastDate() {
        request.setDate(LocalDate.now().minusDays(1));
        
        assertThrows(RuntimeException.class, () -> bookingService.createBooking(request, "testuser"));
    }

    @Test
    void testApproveBooking_OverlapConflict() {
        Booking booking = Booking.builder()
                .id(1L)
                .room(room)
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(BookingStatus.PENDING)
                .build();

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.existsOverlappingApprovedBooking(any(), any(), any(), any(), any()))
                .thenReturn(true);

        assertThrows(RuntimeException.class, () -> bookingService.approveBooking(1L));
    }
}
