package com.nextcart.nextcart.auth_module.service;

import com.nextcart.nextcart.auth_module.entity.RefreshToken;
import com.nextcart.nextcart.auth_module.exceptions.TokenException;
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


    // =========================================================
    // CREATE REFRESH TOKEN
    // =========================================================

    /**
     * Creates a cryptographically secure refresh token.
     *
     * The raw token is returned only to the caller.
     * Only the SHA-256 hash is stored in the database.
     */
    @Transactional
    public String createRefreshToken(User user) {

        if (user == null || user.getId() == null) {
            throw new TokenException(
                    "User is required to create a refresh token"
            );
        }

        String rawToken = generateSecureToken();

        LocalDateTime now = LocalDateTime.now();

        RefreshToken refreshToken =
                RefreshToken.builder()
                        .user(user)
                        .tokenHash(hashToken(rawToken))
                        .expiresAt(
                                now.plusDays(
                                        REFRESH_TOKEN_EXPIRY_DAYS
                                )
                        )
                        .revoked(false)
                        .createdAt(now)
                        .build();

        refreshTokenRepository.save(refreshToken);

        return rawToken;
    }


    // =========================================================
    // VALIDATE REFRESH TOKEN
    // =========================================================

    /**
     * Validates and locks the refresh-token row.
     *
     * The pessimistic lock prevents two concurrent refresh
     * requests from successfully consuming the same token.
     */
    @Transactional
    public RefreshToken validateRefreshToken(
            String rawToken) {

        if (rawToken == null || rawToken.isBlank()) {
            throw new TokenException(
                    "Refresh token is required"
            );
        }

        String tokenHash =
                hashToken(rawToken.trim());

        RefreshToken refreshToken =
                refreshTokenRepository
                        .findByTokenHashForUpdate(tokenHash)
                        .orElseThrow(() ->
                                new TokenException(
                                        "Invalid refresh token"
                                )
                        );

        if (refreshToken.isRevoked()) {
            throw new TokenException(
                    "Refresh token has been revoked"
            );
        }

        LocalDateTime expiresAt =
                refreshToken.getExpiresAt();

        if (expiresAt == null ||
                !expiresAt.isAfter(
                        LocalDateTime.now()
                )) {

            throw new TokenException(
                    "Refresh token has expired"
            );
        }

        User user =
                refreshToken.getUser();

        if (user == null) {
            throw new TokenException(
                    "User account not found"
            );
        }

        if (!user.isEnabled()) {
            throw new TokenException(
                    "User account is disabled"
            );
        }

        return refreshToken;
    }


    // =========================================================
    // ROTATE REFRESH TOKEN
    // =========================================================

    /**
     * Rotates a refresh token atomically.
     *
     * The existing token is first locked and validated,
     * then revoked, and a new refresh token is created.
     */
    @Transactional
    public String rotateRefreshToken(
            String rawToken) {

        RefreshToken oldToken =
                validateRefreshToken(rawToken);

        User user =
                oldToken.getUser();

        revokeToken(oldToken);

        return createRefreshToken(user);
    }


    // =========================================================
    // REVOKE ONE TOKEN
    // =========================================================

    @Transactional
    public void revokeToken(
            RefreshToken refreshToken) {

        if (refreshToken == null ||
                refreshToken.isRevoked()) {

            return;
        }

        refreshToken.setRevoked(true);
        refreshToken.setRevokedAt(
                LocalDateTime.now()
        );

        refreshTokenRepository.save(
                refreshToken
        );
    }


    // =========================================================
    // REVOKE ALL USER TOKENS
    // =========================================================

    /**
     * Revokes all active refresh tokens for a user.
     *
     * Used for:
     * - logout
     * - logout from all devices
     * - password reset
     */
    @Transactional
    public void revokeAllUserTokens(
            Long userId) {

        if (userId == null) {
            return;
        }

        refreshTokenRepository
                .findAllByUserIdAndRevokedFalse(userId)
                .forEach(this::revokeToken);
    }


    // =========================================================
    // GENERATE SECURE TOKEN
    // =========================================================

    private String generateSecureToken() {

        byte[] bytes =
                new byte[TOKEN_BYTES];

        secureRandom.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }


    // =========================================================
    // HASH TOKEN
    // =========================================================

    /**
     * SHA-256 hash used for database storage.
     */
    private String hashToken(
            String token) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance(
                            "SHA-256"
                    );

            byte[] hash =
                    digest.digest(
                            token.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(hash);

        } catch (NoSuchAlgorithmException ex) {

            throw new IllegalStateException(
                    "SHA-256 algorithm is not available",
                    ex
            );
        }
    }
}