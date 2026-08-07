package com.nextcart.nextcart.service;
import com.nextcart.nextcart.repository.RoleRepository;

import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.nextcart.nextcart.repository.UserRepository;
import com.nextcart.nextcart.dto.RegisterRequest;
import com.nextcart.nextcart.dto.RegisterResponse;
import com.nextcart.nextcart.entity.User;
import com.nextcart.nextcart.entity.Role;
import com.nextcart.nextcart.dto.LoginRequest;
import com.nextcart.nextcart.dto.LoginResponse;
import com.nextcart.nextcart.security.JwtUtil;

@Service
public class AuthService {


    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    private final RoleRepository roleRepository;
    private final JwtUtil jwtUtil;

 public AuthService(UserRepository userRepository,
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

public RegisterResponse register(RegisterRequest request) {

    if (userRepository.existsByEmail(request.getEmail())) {
        throw new RuntimeException("Email already registered");
    }

    User user = new User();

    user.setFirstName(request.getFirstName());
    user.setLastName(request.getLastName());
    user.setEmail(request.getEmail());
    user.setPhone(request.getPhone());

    user.setPassword(passwordEncoder.encode(request.getPassword()));

    Role role = roleRepository.findByName("CUSTOMER")
        .orElseThrow(() -> new RuntimeException("Role CUSTOMER not found"));

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
    
public LoginResponse login(LoginRequest request) {

    User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid email or password"));

    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        throw new RuntimeException("Invalid email or password");
    }

    String token = jwtUtil.generateToken(user.getEmail());

    return new LoginResponse(token, "Login successful");
}
}