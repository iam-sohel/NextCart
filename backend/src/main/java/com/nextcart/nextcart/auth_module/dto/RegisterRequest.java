package com.nextcart.nextcart.auth_module.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "First name is required")
    @Size(
            min = 2,
            max = 100,
            message = "First name must be between 2 and 100 characters"
    )
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(
            min = 1,
            max = 100,
            message = "Last name must be between 1 and 100 characters"
    )
    private String lastName;

    /*
     * Customer can register using EITHER email OR phone.
     *
     * email only  -> allowed
     * phone only  -> allowed
     * both        -> rejected by service layer
     * neither     -> rejected by service layer
     */
    @Email(message = "Invalid email address")
    @Size(
            max = 150,
            message = "Email must not exceed 150 characters"
    )
    private String email;

    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Invalid phone number"
    )
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(
            min = 8,
            max = 100,
            message = "Password must be between 8 and 100 characters"
    )
    private String password;
}