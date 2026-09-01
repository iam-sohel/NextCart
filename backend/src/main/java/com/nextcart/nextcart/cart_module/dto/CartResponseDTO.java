package com.nextcart.nextcart.cart_module.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponseDTO {

    private Long id;

    @Builder.Default
    private List<CartItemResponseDTO> items = List.of();

    private Integer totalItems;

    private BigDecimal productPrice;

    private BigDecimal totalDiscount;

    private BigDecimal orderTotal;

    private String currency;
}