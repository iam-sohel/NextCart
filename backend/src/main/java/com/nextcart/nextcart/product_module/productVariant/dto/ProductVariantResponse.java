package com.nextcart.nextcart.product_module.productVariant.dto;

import com.nextcart.nextcart.product_module.productVariant.ProductVariantStatus;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantResponse {

    private Long id;

    private Long productId;

    private String sku;

    private ProductVariantStatus status;
}