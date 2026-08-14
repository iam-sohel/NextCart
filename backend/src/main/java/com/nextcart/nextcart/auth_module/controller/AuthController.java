package com.nextcart.nextcart.auth_module.controller;

import java.util.HashMap;
import java.util.Map;

import com.nextcart.nextcart.auth_module.dto.LoginResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nextcart.nextcart.auth_module.dto.LoginRequest;
import com.nextcart.nextcart.auth_module.dto.RegisterRequest;
import com.nextcart.nextcart.auth_module.dto.RegisterResponse;
import com.nextcart.nextcart.auth_module.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;


    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public RegisterResponse register(
            @Valid @RequestBody RegisterRequest request) {

        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request) {

        return authService.login(request);
    }
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {

        SecurityContextHolder.clearContext();

        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout successful");

        return ResponseEntity.ok(response);
    }
}