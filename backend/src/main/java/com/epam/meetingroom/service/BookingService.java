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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final BookingMapper bookingMapper;

    public BookingService(BookingRepository bookingRepository, 
                              RoomRepository roomRepository, 
                              UserRepository userRepository, 
                              BookingMapper bookingMapper) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.bookingMapper = bookingMapper;
    }

    public BookingResponseDto createBooking(BookingRequestDto request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Room room = roomRepository.findById(request.roomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        validateBookingConstraints(request, null);

        Booking booking = Booking.builder()
                .room(room)
                .user(user)
                .date(request.date())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .agenda(request.agenda())
                .status(BookingStatus.PENDING)
                .durationMinutes(Duration.between(request.startTime(), request.endTime()).toMinutes())
                .build();

        return bookingMapper.toDto(bookingRepository.save(booking));
    }

    public BookingResponseDto updateBooking(Long id, BookingRequestDto request, String username) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (!booking.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized to update this booking");
        }
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be updated");
        }

        validateBookingConstraints(request, id);

        Room room = roomRepository.findById(request.roomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        booking.setRoom(room);
        booking.setDate(request.date());
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());
        booking.setAgenda(request.agenda());
        booking.setDurationMinutes(Duration.between(request.startTime(), request.endTime()).toMinutes());

        return bookingMapper.toDto(bookingRepository.save(booking));
    }

    public void cancelBooking(Long id, String username) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (!booking.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.REJECTED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking already " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new RuntimeException("Booking not found");
        }
        bookingRepository.deleteById(id);
    }

    public BookingResponseDto approveBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be approved");
        }

        // Check for overlaps before approving
        if (bookingRepository.existsOverlappingApprovedBooking(
                booking.getRoom(), booking.getDate(), booking.getStartTime(), booking.getEndTime(), booking.getId())) {
            throw new RuntimeException("Overlapping approved booking exists for this slot");
        }

        booking.setStatus(BookingStatus.APPROVED);
        return bookingMapper.toDto(bookingRepository.save(booking));
    }

    public BookingResponseDto rejectBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        return bookingMapper.toDto(bookingRepository.save(booking));
    }

    public List<BookingResponseDto> getMyBookings(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return bookingRepository.findByUserOrderByDateDescStartTimeDesc(user).stream()
                .map(bookingMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<BookingResponseDto> filterBookings(BookingStatus status) {
        return bookingRepository.findByStatus(status).stream()
                .map(bookingMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<BookingResponseDto> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(bookingMapper::toDto)
                .collect(Collectors.toList());
    }

    private void validateBookingConstraints(BookingRequestDto request, Long bookingId) {
        long duration = Duration.between(request.startTime(), request.endTime()).toMinutes();
        if (duration < 10) {
            throw new RuntimeException("Minimum booking duration is 10 minutes");
        }

        LocalDateTime bookingStart = LocalDateTime.of(request.date(), request.startTime());
        if (!bookingStart.isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Booking must be in the future");
        }
    }
}
