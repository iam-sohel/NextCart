package com.nextcart.nextcart.auth_module.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @Email(message = "Invalid email address")
    private String email;

    private String phone;

    @NotBlank(message = "Password is required")
    private String password;
}