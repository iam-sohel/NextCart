package com.nextcart.nextcart.product_module.productInformation;

import com.nextcart.nextcart.product_module.product_base.ProductEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "product_information",
        indexes = {
                @Index(
                        name = "idx_product_information_product_id",
                        columnList = "product_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductInformationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "product_id",
            nullable = false,
            unique = true
    )
    private ProductEntity productEntity;

    @Column(
            name = "short_description",
            length = 500
    )
    private String shortDescription;

    @Column(
            name = "long_description",
            columnDefinition = "TEXT"
    )
    private String longDescription;

    @Column(
            name = "warranty",
            length = 200
    )
    private String warranty;

    @Column(
            name = "manufacturer",
            length = 200
    )
    private String manufacturer;
}