package com.nextcart.nextcart.order_module;

import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "order_items",
        indexes = {
                @Index(
                        name = "idx_order_items_order_id",
                        columnList = "order_id"
                ),
                @Index(
                        name = "idx_order_items_variant_id",
                        columnList = "product_variant_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // ORDER
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "order_id",
            nullable = false
    )
    private OrderEntity order;

    // =========================================================
    // PRODUCT VARIANT REFERENCE
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "product_variant_id",
            nullable = false
    )
    private ProductVariantEntity productVariant;

    // =========================================================
    // PRODUCT SNAPSHOT
    // =========================================================

    @Column(
            name = "product_name",
            nullable = false,
            length = 255
    )
    private String productName;

    @Column(
            name = "sku",
            nullable = false,
            length = 100
    )
    private String sku;

    // =========================================================
    // QUANTITY
    // =========================================================

    @Column(
            name = "quantity",
            nullable = false
    )
    private Integer quantity;

    // =========================================================
    // PRICE SNAPSHOT
    // =========================================================

    @Column(
            name = "unit_mrp",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal unitMrp;

    @Column(
            name = "unit_selling_price",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal unitSellingPrice;

    @Column(
            name = "discount_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(
            name = "line_total",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal lineTotal;

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

        if (discountAmount == null) {
            discountAmount = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}