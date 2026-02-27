package com.epam.meetingroom.service;

import com.epam.meetingroom.dto.AuthResponse;
import com.epam.meetingroom.dto.LoginRequest;
import com.epam.meetingroom.dto.UserRegistrationRequest;

public interface AuthService {
    AuthResponse authenticateUser(LoginRequest loginRequest);
    void registerUser(UserRegistrationRequest registrationRequest);
}
