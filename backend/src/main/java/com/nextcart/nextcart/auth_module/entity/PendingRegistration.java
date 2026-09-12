package com.nextcart.nextcart.auth_module.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "pending_registrations",
        indexes = {
                @Index(
                        name = "idx_pending_registration_email",
                        columnList = "email"
                ),
                @Index(
                        name = "idx_pending_registration_phone",
                        columnList = "phone"
                ),
                @Index(
                        name = "idx_pending_registration_expires_at",
                        columnList = "expires_at"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingRegistration {

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

    /*
     * Exactly one identifier should be present:
     *
     * Email registration:
     * email != null
     * phone == null
     *
     * Phone registration:
     * email == null
     * phone != null
     */
    @Column(
            name = "email",
            length = 150
    )
    private String email;

    @Column(
            name = "phone",
            length = 20
    )
    private String phone;

    /*
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
            name = "role",
            nullable = false,
            length = 30
    )
    @Builder.Default
    private String role = "CUSTOMER";

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
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

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
     * Registration is complete when the identifier
     * used for registration has been verified.
     */
    public boolean isFullyVerified() {

        if (email != null && !email.isBlank()) {
            return emailVerified;
        }

        if (phone != null && !phone.isBlank()) {
            return phoneVerified;
        }

        return false;
    }

    /**
     * Returns true when the pending registration
     * has passed its registration lifetime.
     */
    public boolean isExpired() {
        return expiresAt == null
                || !expiresAt.isAfter(LocalDateTime.now());
    }

    /**
     * Returns true when this is an email-based registration.
     */
    public boolean isEmailRegistration() {
        return email != null && !email.isBlank();
    }

    /**
     * Returns true when this is a phone-based registration.
     */
    public boolean isPhoneRegistration() {
        return phone != null && !phone.isBlank();
    }
}