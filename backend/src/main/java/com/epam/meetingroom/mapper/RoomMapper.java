package com.epam.meetingroom.mapper;

import com.epam.meetingroom.entity.Room;
import com.epam.meetingroom.dto.RoomDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoomMapper {
    RoomDto toDto(Room room);
    Room toEntity(RoomDto roomDto);
}
