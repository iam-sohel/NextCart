package com.nextcart.nextcart.auth_module.service;

import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextcart.nextcart.auth_module.dto.LoginRequest;
import com.nextcart.nextcart.auth_module.dto.LoginResponse;
import com.nextcart.nextcart.auth_module.dto.RegisterRequest;
import com.nextcart.nextcart.auth_module.dto.RegisterResponse;
import com.nextcart.nextcart.user_module.entity.Role;
import com.nextcart.nextcart.user_module.entity.User;
import com.nextcart.nextcart.user_module.repository.RoleRepository;
import com.nextcart.nextcart.user_module.repository.UserRepository;
import com.nextcart.nextcart.auth_module.security.JwtUtil;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    private final RoleRepository roleRepository;
    private final JwtUtil jwtUtil;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            ModelMapper modelMapper,
            JwtUtil jwtUtil) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.modelMapper = modelMapper;
        this.jwtUtil = jwtUtil;
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

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {

        User user;

        // Login using email
        if (request.getEmail() != null
                && !request.getEmail().isBlank()) {

            user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Invalid email or password"));
        }

        // Login using phone
        else if (request.getPhone() != null
                && !request.getPhone().isBlank()) {

            user = userRepository.findByPhone(request.getPhone())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Invalid phone or password"));
        }

        // Neither email nor phone provided
        else {
            throw new RuntimeException(
                    "Email or phone is required");
        }

        // Verify password
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException(
                    "Invalid credentials");
        }

        // Generate JWT
        String token = jwtUtil.generateToken(user.getEmail());

        return new LoginResponse(
                token,
                "Login successful"
        );
    }
}