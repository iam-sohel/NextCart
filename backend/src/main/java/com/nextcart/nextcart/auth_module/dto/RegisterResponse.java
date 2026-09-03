package com.nextcart.nextcart.auth_module.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterResponse {

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private String role;

    private boolean emailOtpSent;

    private boolean phoneOtpSent;

    private String message;
}