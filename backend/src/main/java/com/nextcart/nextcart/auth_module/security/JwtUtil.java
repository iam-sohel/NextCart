package com.nextcart.nextcart.auth_module.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    /*
     * Local/MVP JWT secret.
     *
     * IMPORTANT:
     * This is intentionally kept inside the application so local development
     * does not require JWT_SECRET environment configuration.
     *
     * The secret must be at least 32 bytes for HS256.
     */
    private static final String JWT_SECRET =
            "NextCart-MVP-JWT-Secret-Key-2026-Saad-Strong-Key";

    private static final long JWT_EXPIRATION_MS = 24 * 60 * 60 * 1000L;

    private final SecretKey key;

    public JwtUtil() {
        this.key = Keys.hmacShaKeyFor(
                JWT_SECRET.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(String email) {

        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(
                        System.currentTimeMillis() + JWT_EXPIRATION_MS
                ))
                .signWith(key)
                .compact();
    }

    public boolean validateToken(String token, String email) {
        try {
            String extractedEmail = extractEmail(token);
            return extractedEmail != null
                    && extractedEmail.equals(email);
        } catch (Exception e) {
            return false;
        }
    }

    public String extractEmail(String token) {

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
}