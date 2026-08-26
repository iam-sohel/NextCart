package com.nextcart.nextcart.checkout_module;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutResponseDTO {

    private Long cartId;

    private List<CheckoutItemResponseDTO> items;

    private Integer totalItems;

    private BigDecimal productPrice;

    private BigDecimal totalDiscount;

    private BigDecimal deliveryCharge;

    private BigDecimal orderTotal;

    private String currency;
}