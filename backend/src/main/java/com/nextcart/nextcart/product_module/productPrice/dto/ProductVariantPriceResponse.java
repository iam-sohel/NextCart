package com.nextcart.nextcart.product_module.productPrice.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantPriceResponse {

    private Long id;

    private Long productVariantId;

    private BigDecimal mrp;

    private BigDecimal sellingPrice;

    private String currency;
}