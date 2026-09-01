package com.nextcart.nextcart.auth_module.service;

import com.nextcart.nextcart.auth_module.dto.*;

public interface AuthService {

    RegisterResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    TokenRefreshResponse refreshAccessToken(
            RefreshTokenRequest request
    );

    void logout(String email);
}