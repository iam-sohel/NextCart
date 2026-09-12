package com.nextcart.nextcart.wishlist_module.entity;

import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;
import com.nextcart.nextcart.user_module.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "wishlists",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_wishlist_user_variant",
                        columnNames = {
                                "user_id",
                                "product_variant_id"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_wishlist_user_id",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_wishlist_product_variant_id",
                        columnList = "product_variant_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wishlist {

    // =========================================================
    // PRIMARY KEY
    // =========================================================

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
    // PRODUCT VARIANT
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "product_variant_id",
            nullable = false
    )
    private ProductVariantEntity productVariant;

    // =========================================================
    // TIMESTAMPS
    // =========================================================

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public Wishlist(
            User user,
            ProductVariantEntity productVariant
    ) {
        this.user = user;
        this.productVariant = productVariant;
    }

    // =========================================================
    // JPA CALLBACKS
    // =========================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();
    }
}