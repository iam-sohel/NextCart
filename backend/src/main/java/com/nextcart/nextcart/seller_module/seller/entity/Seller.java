package com.nextcart.nextcart.seller_module.seller.entity;

import com.nextcart.nextcart.user_module.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "sellers",
        indexes = {
                @Index(name = "idx_sellers_user_id", columnList = "user_id"),
                @Index(name = "idx_sellers_gst_number", columnList = "gst_number"),
                @Index(name = "idx_sellers_active", columnList = "active"),
                @Index(name = "idx_sellers_verified", columnList = "verified")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Seller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Common authentication user.
     * Email, phone, password and role are maintained in User.
     */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true,
            foreignKey = @ForeignKey(name = "fk_sellers_user")
    )
    private User user;

    /**
     * Seller business details.
     */
    @Column(
            name = "business_name",
            nullable = false,
            length = 150
    )
    private String businessName;

    @Column(
            name = "gst_number",
            unique = true,
            length = 30
    )
    private String gstNumber;

    /**
     * Seller verification status.
     */
    @Builder.Default
    @Column(
            name = "verified",
            nullable = false
    )
    private boolean verified = false;

    /**
     * Seller account status.
     */
    @Builder.Default
    @Column(
            name = "active",
            nullable = false
    )
    private boolean active = true;

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

        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}