package com.nextcart.nextcart.auth_module.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String accessToken;

    private String refreshToken;

    private String tokenType;

    private Long userId;

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private String role;

    private String message;
}