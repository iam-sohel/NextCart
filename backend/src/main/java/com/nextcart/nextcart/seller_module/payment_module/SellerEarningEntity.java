package com.nextcart.nextcart.seller_module.payment_module;

import com.nextcart.nextcart.order_module.OrderEntity;
import com.nextcart.nextcart.order_module.OrderItemEntity;
import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "seller_earnings",
        indexes = {
                @Index(
                        name = "idx_seller_earnings_seller_id",
                        columnList = "seller_id"
                ),
                @Index(
                        name = "idx_seller_earnings_order_id",
                        columnList = "order_id"
                ),
                @Index(
                        name = "idx_seller_earnings_order_item_id",
                        columnList = "order_item_id"
                ),
                @Index(
                        name = "idx_seller_earnings_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_seller_earnings_created_at",
                        columnList = "created_at"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerEarningEntity {

    // =========================================================
    // PRIMARY KEY
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // SELLER
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "seller_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_seller_earnings_seller")
    )
    private Seller seller;

    // =========================================================
    // ORDER
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "order_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_seller_earnings_order")
    )
    private OrderEntity order;

    // =========================================================
    // ORDER ITEM
    // =========================================================

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "order_item_id",
            nullable = false,
            unique = true,
            foreignKey = @ForeignKey(name = "fk_seller_earnings_order_item")
    )
    private OrderItemEntity orderItem;

    // =========================================================
    // AMOUNTS
    // =========================================================

    /**
     * Gross amount earned from this order item
     * before platform commission.
     */
    @Column(
            name = "gross_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal grossAmount;

    /**
     * Platform commission deducted from seller earnings.
     *
     * Initially this can be ZERO until commission
     * configuration is introduced.
     */
    @Column(
            name = "commission_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal commissionAmount = BigDecimal.ZERO;

    /**
     * Final amount payable to the seller.
     *
     * netAmount = grossAmount - commissionAmount
     */
    @Column(
            name = "net_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal netAmount;

    // =========================================================
    // STATUS
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 30
    )
    @Builder.Default
    private SellerEarningStatus status = SellerEarningStatus.PENDING;

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