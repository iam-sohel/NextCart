package com.nextcart.nextcart.auth_module.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordRequest {

    @Email(message = "Invalid email address")
    private String email;

    @Pattern(
        regexp = "^[6-9]\\d{9}$",
        message = "Invalid phone number"
    )
    private String phone;
}