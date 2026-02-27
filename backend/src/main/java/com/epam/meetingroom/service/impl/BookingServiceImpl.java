package com.epam.meetingroom.service.impl;

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
import com.epam.meetingroom.service.BookingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final BookingMapper bookingMapper;

    public BookingServiceImpl(BookingRepository bookingRepository, 
                              RoomRepository roomRepository, 
                              UserRepository userRepository, 
                              BookingMapper bookingMapper) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.bookingMapper = bookingMapper;
    }

    @Override
    public BookingResponseDto createBooking(BookingRequestDto request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        validateBookingConstraints(request, null);

        Booking booking = Booking.builder()
                .room(room)
                .user(user)
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .agenda(request.getAgenda())
                .status(BookingStatus.PENDING)
                .durationMinutes(Duration.between(request.getStartTime(), request.getEndTime()).toMinutes())
                .build();

        return bookingMapper.toDto(bookingRepository.save(booking));
    }

    @Override
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

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        booking.setRoom(room);
        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setAgenda(request.getAgenda());
        booking.setDurationMinutes(Duration.between(request.getStartTime(), request.getEndTime()).toMinutes());

        return bookingMapper.toDto(bookingRepository.save(booking));
    }

    @Override
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

    @Override
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

    @Override
    public BookingResponseDto rejectBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        return bookingMapper.toDto(bookingRepository.save(booking));
    }

    @Override
    public List<BookingResponseDto> getMyBookings(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return bookingRepository.findByUserOrderByDateDescStartTimeDesc(user).stream()
                .map(bookingMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponseDto> filterBookings(BookingStatus status) {
        return bookingRepository.findByStatus(status).stream()
                .map(bookingMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponseDto> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(bookingMapper::toDto)
                .collect(Collectors.toList());
    }

    private void validateBookingConstraints(BookingRequestDto request, Long bookingId) {
        // 1. Duration >= 10 minutes
        long duration = Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
        if (duration < 10) {
            throw new RuntimeException("Minimum booking duration is 10 minutes");
        }

        // 2. strictly in the future
        LocalDateTime bookingStart = LocalDateTime.of(request.getDate(), request.getStartTime());
        if (!bookingStart.isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Booking must be in the future");
        }

        // 3. No overlapping APPROVED bookings (Only when status is APPROVED)
        // Wait, requirement 3 says: "No overlapping APPROVED bookings for same room+date"
        // Overlap = newStart < existingEnd AND newEnd > existingStart
        // This check should happen during APPROVAL.
        // But what if multiple PENDING bookings are made for the same slot?
        // That's fine as they are pending. Overlap only matters for APPROVED.
        // I'll keep the overlap check in approveBooking.
    }
}
