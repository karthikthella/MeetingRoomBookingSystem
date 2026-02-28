package com.epam.meetingroom.mapper;

import com.epam.meetingroom.entity.Booking;
import com.epam.meetingroom.dto.BookingResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BookingMapper {
    @Mapping(target = "roomId", source = "room.id")
    @Mapping(target = "roomName", source = "room.name")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "username", source = "user.username")
    BookingResponseDto toDto(Booking booking);
}
