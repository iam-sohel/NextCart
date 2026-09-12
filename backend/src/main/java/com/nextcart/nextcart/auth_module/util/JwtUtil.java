package com.nextcart.nextcart.auth_module.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey secretKey;
    private final long expirationMillis;

    public JwtUtil(
            @Value("${app.security.jwt.secret}") String secret,
            @Value("${app.security.jwt.expiration-ms:900000}") long expirationMillis
    ) {

        if (secret == null || secret.length() < 32) {
            throw new IllegalArgumentException(
                    "JWT secret must be at least 32 characters long"
            );
        }

        if (expirationMillis <= 0) {
            throw new IllegalArgumentException(
                    "JWT expiration must be greater than zero"
            );
        }

        this.secretKey = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );

        this.expirationMillis = expirationMillis;
    }


    // =========================================================
    // GENERATE ACCESS TOKEN
    // =========================================================

    public String generateAccessToken(
            Long userId,
            String email,
            String role
    ) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID is required"
            );
        }

        if (role == null || role.isBlank()) {
            throw new IllegalArgumentException(
                    "User role is required"
            );
        }

        Date now = new Date();

        Date expiry = new Date(
                now.getTime() + expirationMillis
        );

        var builder = Jwts.builder()
                .subject(userId.toString())
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiry);

        /*
         * Email is optional because phone-only customers
         * do not have an email address.
         */
        if (email != null && !email.isBlank()) {
            builder.claim("email", email);
        }

        return builder
                .signWith(secretKey)
                .compact();
    }


    // =========================================================
    // EXTRACT ALL CLAIMS
    // =========================================================

    public Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }


    // =========================================================
    // EXTRACT USER ID
    // =========================================================

    public Long extractUserId(String token) {

        String subject =
                extractAllClaims(token)
                        .getSubject();

        if (subject == null || subject.isBlank()) {
            return null;
        }

        try {
            return Long.valueOf(subject);
        } catch (NumberFormatException ex) {
            return null;
        }
    }


    // =========================================================
    // EXTRACT EMAIL
    // =========================================================

    public String extractEmail(String token) {

        return extractAllClaims(token)
                .get("email", String.class);
    }


    // =========================================================
    // EXTRACT ROLE
    // =========================================================

    public String extractRole(String token) {

        return extractAllClaims(token)
                .get("role", String.class);
    }


    // =========================================================
    // EXTRACT EXPIRATION
    // =========================================================

    public Date extractExpiration(String token) {

        return extractAllClaims(token)
                .getExpiration();
    }


    // =========================================================
    // CHECK EXPIRATION
    // =========================================================

    public boolean isTokenExpired(String token) {

        return extractExpiration(token)
                .before(new Date());
    }


    // =========================================================
    // VALIDATE TOKEN BY USER ID
    // =========================================================

    public boolean isTokenValid(
            String token,
            Long userId
    ) {

        try {

            Long tokenUserId =
                    extractUserId(token);

            return tokenUserId != null
                    && userId != null
                    && tokenUserId.equals(userId)
                    && !isTokenExpired(token);

        } catch (Exception ex) {

            return false;
        }
    }
}