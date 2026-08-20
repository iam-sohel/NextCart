package com.nextcart.nextcart.auth_module.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    // Inject from configuration so the secret is sourced from an environment
    // variable (JWT_SECRET) instead of being hardcoded in source control.
    // Missing value -> application fails to start, which is what we want.
    private final SecretKey key;

    public JwtUtil(@Value("${app.security.jwt.secret:}") String secret) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                "app.security.jwt.secret must be configured (env JWT_SECRET). "
              + "Generate one with `openssl rand -base64 48`.");
        }
        if (secret.getBytes().length < 32) {
            throw new IllegalStateException(
                "app.security.jwt.secret must be at least 32 bytes (256 bits) "
              + "for HS256 signing.");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String email) {

        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(key)
                .compact();
    }

    public boolean validateToken(String token, String email) {
    return extractEmail(token).equals(email);
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
