package com.epam.meetingroom.controller;

import com.epam.meetingroom.entity.enums.BookingStatus;
import com.epam.meetingroom.dto.BookingRequestDto;
import com.epam.meetingroom.dto.BookingResponseDto;
import com.epam.meetingroom.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@Tag(name = "Bookings", description = "Endpoints for managing room bookings")
@SecurityRequirement(name = "Bearer Authentication")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @Operation(summary = "Create a new booking", description = "Creates a new booking for the logged-in user")
    @ApiResponse(responseCode = "200", description = "Booking created successfully")
    public ResponseEntity<BookingResponseDto> createBooking(@Valid @RequestBody BookingRequestDto request, 
                                                            Authentication authentication) {
        return ResponseEntity.ok(bookingService.createBooking(request, authentication.getName()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing booking")
    public ResponseEntity<BookingResponseDto> updateBooking(@PathVariable Long id, 
                                                            @Valid @RequestBody BookingRequestDto request, 
                                                            Authentication authentication) {
        return ResponseEntity.ok(bookingService.updateBooking(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Physically delete a booking (Admin Only)")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's bookings")
    public ResponseEntity<List<BookingResponseDto>> getMyBookings(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getMyBookings(authentication.getName()));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve a booking", description = "Admin only")
    public ResponseEntity<BookingResponseDto> approveBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.approveBooking(id));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reject a booking", description = "Admin only")
    public ResponseEntity<BookingResponseDto> rejectBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.rejectBooking(id));
    }

    @GetMapping("/filter")
    @Operation(summary = "Filter bookings by status")
    public ResponseEntity<List<BookingResponseDto>> filterBookings(@RequestParam BookingStatus status) {
        return ResponseEntity.ok(bookingService.filterBookings(status));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all bookings", description = "Admin only")
    public ResponseEntity<List<BookingResponseDto>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }
}
