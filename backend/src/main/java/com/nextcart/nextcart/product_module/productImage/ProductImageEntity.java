package com.nextcart.nextcart.product_module.productImage;

import com.nextcart.nextcart.product_module.product_base.ProductEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_images", indexes = {@Index(name = "idx_product_images_product_id", columnList = "product_id"), @Index(name = "idx_product_images_primary", columnList = "is_primary"), @Index(name = "idx_product_images_display_order", columnList = "display_order")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity productEntity;

    @Column(name = "image_url", nullable = false, length = 1000)
    private String imageUrl;

    @Column(name = "is_primary", nullable = false)
    @Builder.Default
    private Boolean isPrimary = false;

    @Column(name = "display_order")
    private Integer displayOrder;
}
