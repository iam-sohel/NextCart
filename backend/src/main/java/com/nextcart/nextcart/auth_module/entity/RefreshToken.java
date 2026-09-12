package com.nextcart.nextcart.auth_module.entity;

import com.nextcart.nextcart.user_module.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "refresh_tokens",
        indexes = {
                @Index(
                        name = "idx_refresh_tokens_user_id",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_refresh_tokens_token_hash",
                        columnList = "token_hash"
                ),
                @Index(
                        name = "idx_refresh_tokens_expires_at",
                        columnList = "expires_at"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // USER
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;


    // =========================================================
    // TOKEN HASH
    // =========================================================

    /*
     * Never store the raw refresh token.
     * Only SHA-256 hash is stored.
     */
    @Column(
            name = "token_hash",
            nullable = false,
            unique = true,
            length = 255
    )
    private String tokenHash;


    // =========================================================
    // EXPIRY
    // =========================================================

    @Column(
            name = "expires_at",
            nullable = false
    )
    private LocalDateTime expiresAt;


    // =========================================================
    // REVOCATION
    // =========================================================

    @Builder.Default
    @Column(
            name = "revoked",
            nullable = false
    )
    private boolean revoked = false;


    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;


    // =========================================================
    // AUDIT
    // =========================================================

    @Builder.Default
    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt =
            LocalDateTime.now();

    @Builder.Default
    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt =
            LocalDateTime.now();


    // =========================================================
    // ENTITY CALLBACKS
    // =========================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }
    }


    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();
    }
}