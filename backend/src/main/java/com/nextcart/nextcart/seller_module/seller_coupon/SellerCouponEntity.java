package com.nextcart.nextcart.seller_module.seller_coupon;

import com.nextcart.nextcart.discount_module.DiscountType;
import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "seller_coupons",
        indexes = {
                @Index(name = "idx_seller_coupon_seller_id", columnList = "seller_id"),
                @Index(name = "idx_seller_coupon_code", columnList = "code"),
                @Index(name = "idx_seller_coupon_active", columnList = "active"),
                @Index(name = "idx_seller_coupon_start_at", columnList = "start_at"),
                @Index(name = "idx_seller_coupon_end_at", columnList = "end_at")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_seller_coupon_code",
                        columnNames = {"seller_id", "code"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerCouponEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "seller_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_seller_coupon_seller")
    )
    private Seller seller;

    @Column(name = "code", nullable = false, length = 50)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 20)
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false, precision = 19, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "minimum_order_amount", precision = 19, scale = 2)
    private BigDecimal minimumOrderAmount;

    @Column(name = "maximum_discount_amount", precision = 19, scale = 2)
    private BigDecimal maximumDiscountAmount;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "used_count", nullable = false)
    @Builder.Default
    private Integer usedCount = 0;

    @Column(name = "per_customer_limit")
    private Integer perCustomerLimit;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;

        if (usedCount == null) {
            usedCount = 0;
        }

        if (active == false) {
            active = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}