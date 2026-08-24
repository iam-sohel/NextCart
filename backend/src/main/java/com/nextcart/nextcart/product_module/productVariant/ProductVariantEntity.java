package com.nextcart.nextcart.product_module.productVariant;

import com.nextcart.nextcart.product_module.product_base.ProductEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "product_variants",
        indexes = {
                @Index(
                        name = "idx_product_variants_product_id",
                        columnList = "product_id"
                ),
                @Index(
                        name = "idx_product_variants_status",
                        columnList = "status"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity productEntity;

    @Column(name = "sku", nullable = false, unique = true, length = 100)
    private String sku;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private ProductVariantStatus status =
            ProductVariantStatus.ACTIVE;
}