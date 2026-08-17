package com.nextcart.nextcart.product_module.dto.ProductVariant;

import lombok.*;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantResponse {

    private Long id;

    private Long productId;

    private String sku;

    private BigDecimal price;

    private Map<String, String> attributes;

    private String status;
}