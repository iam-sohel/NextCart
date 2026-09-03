package com.nextcart.nextcart.auth_module.service;

import com.nextcart.nextcart.auth_module.entity.RefreshToken;
import com.nextcart.nextcart.auth_module.repository.RefreshTokenRepository;
import com.nextcart.nextcart.user_module.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final int TOKEN_BYTES = 64;
    private static final long REFRESH_TOKEN_EXPIRY_DAYS = 30;

    private final RefreshTokenRepository refreshTokenRepository;

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Creates and stores a refresh token.
     *
     * The raw token is returned only once to the caller.
     * Only its SHA-256 hash is stored in the database.
     */
    @Transactional
    public String createRefreshToken(User user) {

        String rawToken = generateSecureToken();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(hashToken(rawToken))
                .expiresAt(
                        LocalDateTime.now()
                                .plusDays(REFRESH_TOKEN_EXPIRY_DAYS)
                )
                .revoked(false)
                .createdAt(LocalDateTime.now())
                .build();

        refreshTokenRepository.save(refreshToken);

        return rawToken;
    }

    /**
     * Validates a refresh token and returns its entity.
     */
    @Transactional(readOnly = true)
    public RefreshToken validateRefreshToken(String rawToken) {

        if (rawToken == null || rawToken.isBlank()) {
            throw new IllegalArgumentException(
                    "Refresh token is required"
            );
        }

        String tokenHash = hashToken(rawToken);

        RefreshToken refreshToken = refreshTokenRepository
                .findByTokenHash(tokenHash)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid refresh token"
                        )
                );

        if (refreshToken.isRevoked()) {
            throw new IllegalArgumentException(
                    "Refresh token has been revoked"
            );
        }

        if (refreshToken.getExpiresAt()
                .isBefore(LocalDateTime.now())) {

            throw new IllegalArgumentException(
                    "Refresh token has expired"
            );
        }

        if (refreshToken.getUser() == null
                || !refreshToken.getUser().isEnabled()) {

            throw new IllegalArgumentException(
                    "User account is disabled"
            );
        }

        return refreshToken;
    }

    /**
     * Rotates a refresh token.
     *
     * The old token is revoked and a new token is generated.
     */
    @Transactional
    public String rotateRefreshToken(String rawToken) {

        RefreshToken oldToken =
                validateRefreshToken(rawToken);

        revokeToken(oldToken);

        return createRefreshToken(oldToken.getUser());
    }

    /**
     * Revokes one refresh token.
     */
    @Transactional
    public void revokeToken(RefreshToken refreshToken) {

        if (refreshToken == null || refreshToken.isRevoked()) {
            return;
        }

        refreshToken.setRevoked(true);
        refreshToken.setRevokedAt(LocalDateTime.now());

        refreshTokenRepository.save(refreshToken);
    }

    /**
     * Revokes all refresh tokens belonging to a user.
     *
     * Useful for logout-all-devices and password reset.
     */
    @Transactional
    public void revokeAllUserTokens(Long userId) {

        if (userId == null) {
            return;
        }

        refreshTokenRepository
                .findAllByUserIdAndRevokedFalse(userId)
                .forEach(this::revokeToken);
    }

    /**
     * Generates a cryptographically secure random token.
     */
    private String generateSecureToken() {

        byte[] bytes = new byte[TOKEN_BYTES];

        secureRandom.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    /**
     * SHA-256 hash used for database storage.
     */
    private String hashToken(String token) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    token.getBytes(StandardCharsets.UTF_8)
            );

            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(hash);

        } catch (NoSuchAlgorithmException e) {

            throw new IllegalStateException(
                    "SHA-256 algorithm is not available",
                    e
            );
        }
    }
}