package com.epam.meetingroom.service;

import com.epam.meetingroom.entity.enums.BookingStatus;
import com.epam.meetingroom.entity.Booking;
import com.epam.meetingroom.entity.Room;
import com.epam.meetingroom.dto.RoomDto;
import com.epam.meetingroom.mapper.RoomMapper;
import com.epam.meetingroom.repository.BookingRepository;
import com.epam.meetingroom.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final RoomMapper roomMapper;

    public RoomService(RoomRepository roomRepository, 
                           BookingRepository bookingRepository, 
                           RoomMapper roomMapper) {
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
        this.roomMapper = roomMapper;
    }

    public RoomDto createRoom(RoomDto roomDto) {
        if (roomRepository.existsByName(roomDto.name())) {
            throw new RuntimeException("Room with name already exists");
        }
        Room room = roomMapper.toEntity(roomDto);
        return roomMapper.toDto(roomRepository.save(room));
    }

    public RoomDto updateRoom(Long id, RoomDto roomDto) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        
        room.setName(roomDto.name());
        room.setCapacity(roomDto.capacity());
        room.setFloorNumber(roomDto.floorNumber());
        
        return roomMapper.toDto(roomRepository.save(room));
    }

    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        
        // Use custom repository method to delete all associated bookings
        bookingRepository.deleteByRoom(room);
        
        roomRepository.delete(room);
    }

    public RoomDto getRoomById(Long id) {
        return roomRepository.findById(id)
                .map(roomMapper::toDto)
                .orElseThrow(() -> new RuntimeException("Room not found"));
    }

    public List<RoomDto> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(roomMapper::toDto)
                .collect(Collectors.toList());
    }
}
