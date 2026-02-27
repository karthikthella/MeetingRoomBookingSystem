package com.epam.meetingroom.service.impl;

import com.epam.meetingroom.domain.enums.BookingStatus;
import com.epam.meetingroom.domain.model.Booking;
import com.epam.meetingroom.domain.model.Room;
import com.epam.meetingroom.dto.RoomDto;
import com.epam.meetingroom.mapper.RoomMapper;
import com.epam.meetingroom.repository.BookingRepository;
import com.epam.meetingroom.repository.RoomRepository;
import com.epam.meetingroom.service.RoomService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final RoomMapper roomMapper;

    public RoomServiceImpl(RoomRepository roomRepository, 
                           BookingRepository bookingRepository, 
                           RoomMapper roomMapper) {
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
        this.roomMapper = roomMapper;
    }

    @Override
    public RoomDto createRoom(RoomDto roomDto) {
        if (roomRepository.existsByName(roomDto.getName())) {
            throw new RuntimeException("Room with name already exists");
        }
        Room room = roomMapper.toEntity(roomDto);
        return roomMapper.toDto(roomRepository.save(room));
    }

    @Override
    public RoomDto updateRoom(Long id, RoomDto roomDto) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        
        room.setName(roomDto.getName());
        room.setCapacity(roomDto.getCapacity());
        room.setFloorNumber(roomDto.getFloorNumber());
        
        return roomMapper.toDto(roomRepository.save(room));
    }

    @Override
    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        
        // Auto-REJECT all PENDING bookings for this room
        List<Booking> pendingBookings = bookingRepository.findByRoomAndStatus(room, BookingStatus.PENDING);
        for (Booking booking : pendingBookings) {
            booking.setStatus(BookingStatus.REJECTED);
        }
        bookingRepository.saveAll(pendingBookings);
        
        roomRepository.delete(room);
    }

    @Override
    public RoomDto getRoomById(Long id) {
        return roomRepository.findById(id)
                .map(roomMapper::toDto)
                .orElseThrow(() -> new RuntimeException("Room not found"));
    }

    @Override
    public List<RoomDto> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(roomMapper::toDto)
                .collect(Collectors.toList());
    }
}
