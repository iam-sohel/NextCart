package com.nextcart.nextcart.auth_module.service;

import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextcart.nextcart.auth_module.dto.LoginRequest;
import com.nextcart.nextcart.auth_module.dto.LoginResponse;
import com.nextcart.nextcart.auth_module.dto.RefreshTokenRequest;
import com.nextcart.nextcart.auth_module.dto.RegisterRequest;
import com.nextcart.nextcart.auth_module.dto.RegisterResponse;
import com.nextcart.nextcart.auth_module.dto.TokenRefreshResponse;
import com.nextcart.nextcart.auth_module.entity.RefreshToken;
import com.nextcart.nextcart.auth_module.security.JwtUtil;
import com.nextcart.nextcart.user_module.entity.Role;
import com.nextcart.nextcart.user_module.entity.User;
import com.nextcart.nextcart.user_module.repository.RoleRepository;
import com.nextcart.nextcart.user_module.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    private final RoleRepository roleRepository;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            ModelMapper modelMapper,
            JwtUtil jwtUtil,
            RefreshTokenService refreshTokenService) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.modelMapper = modelMapper;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        // Fetch CUSTOMER role or create it dynamically if missing in Database
        Role role = roleRepository.findByName("CUSTOMER")
                .orElseGet(() -> roleRepository.findByName("ROLE_CUSTOMER")
                        .orElseGet(() -> {
                            Role newRole = new Role();
                            newRole.setName("CUSTOMER");
                            return roleRepository.save(newRole);
                        }));

        user.setRole(role);
        user.setEnabled(true);

        userRepository.save(user);

        RegisterResponse response = new RegisterResponse();

        response.setId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setMessage("User registered successfully");

        return response;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {

        User user;

        // Login using email
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        }
        // Login using phone
        else if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user = userRepository.findByPhone(request.getPhone())
                    .orElseThrow(() -> new RuntimeException("Invalid phone or password"));
        } else {
            throw new RuntimeException("Email or phone is required");
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Generate Access Token (JWT) & Refresh Token
        String accessToken = jwtUtil.generateToken(user.getEmail());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return new LoginResponse(
                accessToken,
                refreshToken.getToken(),
                "Login successful"
        );
    }

    @Transactional
    public TokenRefreshResponse refreshAccessToken(RefreshTokenRequest request) {
        return refreshTokenService.findByToken(request.getRefreshToken())
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String newAccessToken = jwtUtil.generateToken(user.getEmail());
                    RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user);
                    return new TokenRefreshResponse(newAccessToken, newRefreshToken.getToken());
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not present in database!"));
    }

    @Transactional
    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        refreshTokenService.deleteByUserId(user.getId());
    }
}