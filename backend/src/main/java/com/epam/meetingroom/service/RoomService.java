package com.epam.meetingroom.service;

import com.epam.meetingroom.dto.RoomDto;

import java.util.List;

public interface RoomService {
    RoomDto createRoom(RoomDto roomDto);
    RoomDto updateRoom(Long id, RoomDto roomDto);
    void deleteRoom(Long id);
    RoomDto getRoomById(Long id);
    List<RoomDto> getAllRooms();
}
