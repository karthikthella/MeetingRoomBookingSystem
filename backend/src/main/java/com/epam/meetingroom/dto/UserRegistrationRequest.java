package com.epam.meetingroom.dto;

import com.epam.meetingroom.entity.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserRegistrationRequest(
    @NotBlank String username,
    @NotBlank String password,
    @NotBlank @Email String email,
    Role role
) {}
