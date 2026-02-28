package com.epam.meetingroom.dto;

import com.epam.meetingroom.entity.enums.Role;

public record AuthResponse(
    String token,
    String username,
    Role role
) {}
