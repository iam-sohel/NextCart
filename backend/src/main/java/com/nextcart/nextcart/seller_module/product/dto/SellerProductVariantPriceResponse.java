package com.nextcart.nextcart.seller_module.product.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerProductVariantPriceResponse {

    private Long id;

    private BigDecimal mrp;

    private BigDecimal sellingPrice;

    private BigDecimal discountPercentage;

    private String currency;
}