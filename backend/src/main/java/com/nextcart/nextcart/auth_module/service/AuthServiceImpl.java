        package com.nextcart.nextcart.auth_module.service;

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
import com.nextcart.nextcart.user_module.exceptions.UserAlreadyExistsException;
import com.nextcart.nextcart.user_module.repository.RoleRepository;
import com.nextcart.nextcart.user_module.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final String CUSTOMER_ROLE = "CUSTOMER";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;


    // =========================================================
    // REGISTER
    // =========================================================

    @Override
    @Transactional
    public RegisterResponse register(RegisterRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Registration request is required"
            );
        }

        if (request.getFirstName() == null ||
                request.getFirstName().isBlank()) {

            throw new IllegalArgumentException(
                    "First name is required"
            );
        }

        if (request.getLastName() == null ||
                request.getLastName().isBlank()) {

            throw new IllegalArgumentException(
                    "Last name is required"
            );
        }

        if (request.getEmail() == null ||
                request.getEmail().isBlank()) {

            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        if (request.getPhone() == null ||
                request.getPhone().isBlank()) {

            throw new IllegalArgumentException(
                    "Phone number is required"
            );
        }

        if (request.getPassword() == null ||
                request.getPassword().isBlank()) {

            throw new IllegalArgumentException(
                    "Password is required"
            );
        }

        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        String phone =
                request.getPhone()
                        .trim();

        // -----------------------------------------------------
        // EMAIL DUPLICATE CHECK
        // -----------------------------------------------------

        if (userRepository.existsByEmailIgnoreCase(email)) {

            throw new UserAlreadyExistsException(
                    "Email is already registered"
            );
        }

        // -----------------------------------------------------
        // PHONE DUPLICATE CHECK
        // -----------------------------------------------------

        if (userRepository.existsByPhone(phone)) {

            throw new UserAlreadyExistsException(
                    "Phone number is already registered"
            );
        }

        // -----------------------------------------------------
        // CUSTOMER ROLE
        // -----------------------------------------------------

        Role customerRole =
                roleRepository
                        .findByNameIgnoreCase(CUSTOMER_ROLE)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "CUSTOMER role is not configured"
                                )
                        );

        // -----------------------------------------------------
        // CREATE USER
        // -----------------------------------------------------

        User user = new User();

        user.setFirstName(
                request.getFirstName().trim()
        );

        user.setLastName(
                request.getLastName().trim()
        );

        user.setEmail(email);

        user.setPhone(phone);

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setRole(customerRole);

        user.setEnabled(true);

        User savedUser =
                userRepository.save(user);

        // -----------------------------------------------------
        // REGISTER RESPONSE
        // -----------------------------------------------------

        RegisterResponse response =
                new RegisterResponse();

        response.setId(
                savedUser.getId()
        );

        response.setFirstName(
                savedUser.getFirstName()
        );

        response.setLastName(
                savedUser.getLastName()
        );

        response.setEmail(
                savedUser.getEmail()
        );

        response.setMessage(
                "User registered successfully"
        );

        return response;
    }


    // =========================================================
    // LOGIN
    // =========================================================

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Login request is required"
            );
        }

        if (request.getPassword() == null ||
                request.getPassword().isBlank()) {

            throw new BadCredentialsException(
                    "Invalid email/phone or password"
            );
        }

        User user;

        // -----------------------------------------------------
        // LOGIN USING EMAIL
        // -----------------------------------------------------

        if (request.getEmail() != null &&
                !request.getEmail().isBlank()) {

            String email =
                    request.getEmail()
                            .trim()
                            .toLowerCase();

            user = userRepository
                    .findByEmailIgnoreCase(email)
                    .orElseThrow(() ->
                            new BadCredentialsException(
                                    "Invalid email/phone or password"
                            )
                    );

        }

        // -----------------------------------------------------
        // LOGIN USING PHONE
        // -----------------------------------------------------

        else if (request.getPhone() != null &&
                !request.getPhone().isBlank()) {

            String phone =
                    request.getPhone()
                            .trim();

            user = userRepository
                    .findByPhone(phone)
                    .orElseThrow(() ->
                            new BadCredentialsException(
                                    "Invalid email/phone or password"
                            )
                    );

        }

        else {
            throw new BadCredentialsException(
                    "Email or phone is required"
            );
        }

        // -----------------------------------------------------
        // ACCOUNT STATUS
        // -----------------------------------------------------

        if (!user.isEnabled()) {
            throw new BadCredentialsException(
                    "Invalid email/phone or password"
            );
        }

        // -----------------------------------------------------
        // PASSWORD
        // -----------------------------------------------------

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {

            throw new BadCredentialsException(
                    "Invalid email/phone or password"
            );
        }

        // -----------------------------------------------------
        // ACCESS TOKEN
        // -----------------------------------------------------

        String accessToken =
                jwtUtil.generateToken(user);

        // -----------------------------------------------------
        // REFRESH TOKEN
        // -----------------------------------------------------

        RefreshToken refreshToken =
                refreshTokenService.createRefreshToken(
                        user
                );

        // -----------------------------------------------------
        // USER RESPONSE
        // -----------------------------------------------------

        LoginResponse.UserResponse userResponse =
                new LoginResponse.UserResponse(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmail(),
                        user.getPhone()
                );

        // -----------------------------------------------------
        // LOGIN RESPONSE
        // -----------------------------------------------------

        return new LoginResponse(
                accessToken,
                refreshToken.getToken(),
                "Login successful",
                userResponse
        );
    }


    // =========================================================
    // REFRESH ACCESS TOKEN
    // =========================================================

    @Override
    @Transactional
    public TokenRefreshResponse refreshAccessToken(
            RefreshTokenRequest request) {

        if (request == null ||
                request.getRefreshToken() == null ||
                request.getRefreshToken().isBlank()) {

            throw new BadCredentialsException(
                    "Refresh token is required"
            );
        }

        String token =
                request.getRefreshToken().trim();

        RefreshToken refreshToken =
                refreshTokenService
                        .findByToken(token)
                        .map(refreshTokenService::verifyExpiration)
                        .orElseThrow(() ->
                                new BadCredentialsException(
                                        "Invalid refresh token"
                                )
                        );

        User user =
                refreshToken.getUser();

        if (user == null) {
            throw new BadCredentialsException(
                    "Invalid refresh token"
            );
        }

        if (!user.isEnabled()) {
            throw new BadCredentialsException(
                    "User account is disabled"
            );
        }

        // -----------------------------------------------------
        // NEW ACCESS TOKEN
        // -----------------------------------------------------

        String newAccessToken =
                jwtUtil.generateToken(user);

        // -----------------------------------------------------
        // REFRESH TOKEN ROTATION
        // -----------------------------------------------------

        RefreshToken newRefreshToken =
                refreshTokenService.createRefreshToken(
                        user
                );

        return new TokenRefreshResponse(
                newAccessToken,
                newRefreshToken.getToken()
        );
    }


    // =========================================================
    // LOGOUT
    // =========================================================

    @Override
    @Transactional
    public void logout(String email) {

        if (email == null ||
                email.isBlank()) {

            throw new BadCredentialsException(
                    "Authenticated user is required"
            );
        }

        String normalizedEmail =
                email.trim().toLowerCase();

        User user =
                userRepository
                        .findByEmailIgnoreCase(
                                normalizedEmail
                        )
                        .orElseThrow(() ->
                                new BadCredentialsException(
                                        "Authenticated user not found"
                                )
                        );

        refreshTokenService.deleteByUserId(
                user.getId()
        );
    }
}
