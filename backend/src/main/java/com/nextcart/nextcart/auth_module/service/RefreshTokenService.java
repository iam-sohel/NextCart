package com.nextcart.nextcart.auth_module.service;

import com.nextcart.nextcart.auth_module.entity.RefreshToken;
import com.nextcart.nextcart.user_module.entity.User;

import java.util.Optional;

public interface RefreshTokenService {
    RefreshToken createRefreshToken(User user);
    RefreshToken verifyExpiration(RefreshToken token);
    Optional<RefreshToken> findByToken(String token);
    void deleteByUserId(Long userId);
}