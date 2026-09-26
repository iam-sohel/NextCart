package com.nextcart.nextcart.product_module.productImage.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageResponse {

    private Long id;

    private Long productId;

    private String imageUrl;

    private Boolean isPrimary;

    private Integer displayOrder;
}