        package com.nextcart.nextcart.auth_module.security;

import com.nextcart.nextcart.user_module.entity.User;
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
    private final long expirationMs;

    public JwtUtil(
            @Value("${app.security.jwt.secret}") String jwtSecret,
            @Value("${app.security.jwt.expiration-ms:900000}") long expirationMs) {

        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException(
                    "JWT secret must be configured"
            );
        }

        byte[] secretBytes =
                jwtSecret.getBytes(StandardCharsets.UTF_8);

        if (secretBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT secret must contain at least 32 bytes"
            );
        }

        if (expirationMs <= 0) {
            throw new IllegalStateException(
                    "JWT expiration must be greater than zero"
            );
        }

        this.secretKey =
                Keys.hmacShaKeyFor(secretBytes);

        this.expirationMs = expirationMs;
    }


    // =========================================================
    // GENERATE ACCESS TOKEN
    // =========================================================

    public String generateToken(User user) {

        if (user == null) {
            throw new IllegalArgumentException(
                    "User cannot be null"
            );
        }

        if (user.getId() == null) {
            throw new IllegalArgumentException(
                    "User ID cannot be null"
            );
        }

        /*
         * IMPORTANT:
         * isBlank() and trim() are called on the email String,
         * NOT on the User object.
         */

        String email = user.getEmail();

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "User email cannot be null or blank"
            );
        }

        if (user.getRole() == null) {
            throw new IllegalStateException(
                    "User role is not configured"
            );
        }

        String role = user.getRole().getName();

        if (role == null || role.isBlank()) {
            throw new IllegalStateException(
                    "User role name is not configured"
            );
        }

        email = email.trim().toLowerCase();

        role = role.trim().toUpperCase();

        Date issuedAt = new Date();

        Date expiration =
                new Date(
                        issuedAt.getTime() + expirationMs
                );

        return Jwts.builder()
                .subject(email)
                .claim("userId", user.getId())
                .claim("role", role)
                .issuedAt(issuedAt)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();
    }


    // =========================================================
    // VALIDATE TOKEN
    // =========================================================

    public boolean validateToken(
            String token,
            String email) {

        if (token == null ||
                token.isBlank() ||
                email == null ||
                email.isBlank()) {

            return false;
        }

        try {

            String extractedEmail =
                    extractEmail(token);

            return extractedEmail != null &&
                    extractedEmail.equalsIgnoreCase(
                            email.trim()
                    );

        } catch (Exception exception) {

            return false;
        }
    }


    // =========================================================
    // EXTRACT EMAIL
    // =========================================================

    public String extractEmail(String token) {

        return extractClaims(token)
                .getSubject();
    }


    // =========================================================
    // EXTRACT ROLE
    // =========================================================

    public String extractRole(String token) {

        return extractClaims(token)
                .get("role", String.class);
    }


    // =========================================================
    // EXTRACT USER ID
    // =========================================================

    public Long extractUserId(String token) {

        Number userId =
                extractClaims(token)
                        .get("userId", Number.class);

        if (userId == null) {
            return null;
        }

        return userId.longValue();
    }


    // =========================================================
    // CHECK TOKEN EXPIRATION
    // =========================================================

    public boolean isTokenExpired(String token) {

        try {

            Date expiration =
                    extractClaims(token)
                            .getExpiration();

            return expiration == null ||
                    expiration.before(new Date());

        } catch (Exception exception) {

            return true;
        }
    }


    // =========================================================
    // EXTRACT CLAIMS
    // =========================================================

    private Claims extractClaims(String token) {

        if (token == null ||
                token.isBlank()) {

            throw new IllegalArgumentException(
                    "JWT token cannot be null or blank"
            );
        }

        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
