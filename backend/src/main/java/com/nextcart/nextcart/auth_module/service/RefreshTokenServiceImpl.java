package com.nextcart.nextcart.auth_module.service;

import com.nextcart.nextcart.auth_module.entity.RefreshToken;
import com.nextcart.nextcart.auth_module.repository.RefreshTokenRepository;
import com.nextcart.nextcart.user_module.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {

    @Value("${jwt.refresh.expiration.ms:604800000}")
    private Long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenServiceImpl(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Override
    @Transactional
    public RefreshToken createRefreshToken(User user) {

        refreshTokenRepository.deleteByUser_Id(user.getId());

        refreshTokenRepository.flush();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Override
    @Transactional
    public RefreshToken verifyExpiration(RefreshToken token) {

        if (token.isRevoked()
                || token.getExpiryDate().compareTo(Instant.now()) < 0) {

            refreshTokenRepository.delete(token);

            throw new RuntimeException(
                    "Refresh token was expired or revoked. Please log in again."
            );
        }

        return token;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Override
    @Transactional
    public void deleteByUserId(Long userId) {

        refreshTokenRepository.deleteByUser_Id(userId);
    }
}