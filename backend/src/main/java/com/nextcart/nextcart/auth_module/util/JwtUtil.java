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

        Date now = new Date();

        Date expiry = new Date(
                now.getTime() + expirationMillis
        );

        return Jwts.builder()
                /*
                 * Use userId as JWT subject.
                 *
                 * This works for both:
                 * - email users
                 * - phone-only users
                 */
                .subject(String.valueOf(userId))

                .claim("userId", userId)
                .claim("role", role)

                /*
                 * Keep email as an optional claim.
                 *
                 * Phone-only users may have email = null,
                 * so do not put a null claim into the JWT.
                 */
                .claim(
                        "email",
                        email != null && !email.isBlank()
                                ? email
                                : ""
                )

                .issuedAt(now)
                .expiration(expiry)
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
    // EXTRACT EMAIL
    // =========================================================

    public String extractEmail(String token) {

        return extractAllClaims(token)
                .get("email", String.class);
    }

    // =========================================================
    // EXTRACT USER ID
    // =========================================================

    public Long extractUserId(String token) {

        Number userId =
                extractAllClaims(token)
                        .get("userId", Number.class);

        return userId != null
                ? userId.longValue()
                : null;
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
                    && tokenUserId.equals(userId)
                    && !isTokenExpired(token);

        } catch (Exception ex) {

            return false;
        }
    }
}