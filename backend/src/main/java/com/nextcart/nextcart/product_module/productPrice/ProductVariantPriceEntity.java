package com.nextcart.nextcart.product_module.productPrice;

import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "product_variant_prices",
        indexes = {
                @Index(
                        name = "idx_variant_price_variant_id",
                        columnList = "product_variant_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantPriceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "product_variant_id",
            nullable = false,
            unique = true
    )
    private ProductVariantEntity productVariant;

    @Column(
            name = "mrp",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal mrp;

    @Column(
            name = "selling_price",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal sellingPrice;

    @Column(
            name = "discount_percentage",
            precision = 5,
            scale = 2
    )
    private BigDecimal discountPercentage;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency;

    @Column(name = "effective_from")
    private LocalDateTime effectiveFrom;

    @Column(name = "effective_until")
    private LocalDateTime effectiveUntil;
}