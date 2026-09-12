package com.nextcart.nextcart.seller_module.inventory_module.entity;

import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "inventory_items",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_inventory_product_variant",
                        columnNames = {
                                "inventory_id",
                                "product_variant_id"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_inventory_items_inventory_id",
                        columnList = "inventory_id"
                ),
                @Index(
                        name = "idx_inventory_items_variant_id",
                        columnList = "product_variant_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "inventory_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_inventory_items_inventory"
            )
    )
    private Inventory inventory;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "product_variant_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_inventory_items_product_variant"
            )
    )
    private ProductVariantEntity productVariant;

    @Column(name = "available_stock", nullable = false)
    @Builder.Default
    private Integer availableStock = 0;

    @Column(name = "reserved_stock", nullable = false)
    @Builder.Default
    private Integer reservedStock = 0;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
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