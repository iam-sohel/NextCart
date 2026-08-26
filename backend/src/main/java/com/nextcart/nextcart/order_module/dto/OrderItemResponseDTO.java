package com.nextcart.nextcart.order_module.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponseDTO {

    private Long id;

    private Long productVariantId;

    private String productName;

    private String sku;

    private Integer quantity;

    private BigDecimal unitMrp;

    private BigDecimal unitSellingPrice;

    private BigDecimal discountAmount;

    private BigDecimal lineTotal;
}