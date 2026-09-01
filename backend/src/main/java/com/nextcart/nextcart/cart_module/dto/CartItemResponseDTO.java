package com.nextcart.nextcart.cart_module.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponseDTO {

    private Long id;

    private Long productId;

    private Long productVariantId;

    private String sku;

    private String productName;

    private Integer quantity;

    private BigDecimal mrp;

    private BigDecimal sellingPrice;

    private BigDecimal discountAmount;

    private BigDecimal unitPrice;

    private BigDecimal lineTotal;

    private String currency;
}