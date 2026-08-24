package com.nextcart.nextcart.product_module.variantAttribute;

import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "variant_attributes",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_variant_attribute_name",
                        columnNames = {
                                "variant_id",
                                "attribute_name"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_variant_attributes_variant_id",
                        columnList = "variant_id"
                ),
                @Index(
                        name = "idx_variant_attributes_name_value",
                        columnList = "attribute_name, attribute_value"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VariantAttributeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "variant_id",
            nullable = false
    )
    private ProductVariantEntity variant;

    @Column(
            name = "attribute_name",
            nullable = false,
            length = 100
    )
    private String attributeName;

    @Column(
            name = "attribute_value",
            nullable = false,
            length = 255
    )
    private String attributeValue;
}