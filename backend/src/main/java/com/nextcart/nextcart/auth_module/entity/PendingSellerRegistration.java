package com.nextcart.nextcart.auth_module.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "pending_seller_registrations",
        indexes = {
                @Index(
                        name = "idx_pending_seller_email",
                        columnList = "email"
                ),
                @Index(
                        name = "idx_pending_seller_phone",
                        columnList = "phone"
                ),
                @Index(
                        name = "idx_pending_seller_expires_at",
                        columnList = "expires_at"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingSellerRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "first_name",
            nullable = false,
            length = 100
    )
    private String firstName;

    @Column(
            name = "last_name",
            nullable = false,
            length = 100
    )
    private String lastName;

    @Column(
            name = "email",
            nullable = false,
            length = 150
    )
    private String email;

    @Column(
            name = "phone",
            nullable = false,
            length = 20
    )
    private String phone;

    /**
     * BCrypt encoded password.
     * Never store the raw password.
     */
    @Column(
            name = "password_hash",
            nullable = false,
            length = 255
    )
    private String passwordHash;

    @Column(
            name = "business_name",
            nullable = false,
            length = 150
    )
    private String businessName;

    /**
     * GST can be provided during registration.
     * Final KYC verification happens later through SellerKyc.
     */
    @Column(
            name = "gst_number",
            length = 30
    )
    private String gstNumber;

    @Column(
            name = "email_otp",
            length = 10
    )
    private String emailOtp;

    @Column(
            name = "phone_otp",
            length = 10
    )
    private String phoneOtp;

    @Column(
            name = "email_verified",
            nullable = false
    )
    @Builder.Default
    private boolean emailVerified = false;

    @Column(
            name = "phone_verified",
            nullable = false
    )
    @Builder.Default
    private boolean phoneVerified = false;

    @Column(
            name = "expires_at",
            nullable = false
    )
    private LocalDateTime expiresAt;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (expiresAt == null) {
            expiresAt = now.plusMinutes(15);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Seller registration is complete only when
     * both email and phone are verified.
     */
    public boolean isFullyVerified() {
        return emailVerified && phoneVerified;
    }

    /**
     * Checks whether the pending registration has expired.
     */
    public boolean isExpired() {
        return expiresAt == null
                || !expiresAt.isAfter(LocalDateTime.now());
    }
}