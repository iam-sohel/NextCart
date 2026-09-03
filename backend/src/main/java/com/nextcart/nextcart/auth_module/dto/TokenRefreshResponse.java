package com.nextcart.nextcart.auth_module.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenRefreshResponse {

    private String accessToken;

    private String refreshToken;

    private String tokenType;

    private String message;
}