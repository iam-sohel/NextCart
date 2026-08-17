package com.nextcart.nextcart.product_module.dto.productImage;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImageResponse {

    private Long id;

    private Long productId;

    private String imageUrl;

    private Boolean isPrimary;

    private Integer displayOrder;
}