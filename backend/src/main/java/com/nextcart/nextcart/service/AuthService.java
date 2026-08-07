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

@Service
public class AuthService {


    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    private final RoleRepository roleRepository;

    public AuthService(UserRepository userRepository,
                   RoleRepository roleRepository,
                   PasswordEncoder passwordEncoder,
                   ModelMapper modelMapper) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.modelMapper = modelMapper;
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
    return new LoginResponse("JWT_TOKEN", "Login successful");
}
}