package com.nextcart.nextcart.checkout_module;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutItemResponseDTO {

    private Long cartItemId;

    private Long productId;

    private Long productVariantId;

    private String productName;

    private Integer quantity;

    private BigDecimal unitPrice;

    private BigDecimal discount;

    private BigDecimal lineTotal;
}