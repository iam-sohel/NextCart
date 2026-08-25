package com.nextcart.nextcart.cart_module.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponseDTO {

    private Long id;

    private Long userId;

    private String sessionId;

    @Builder.Default
    private List<CartItemResponseDTO> items = new ArrayList<>();

    private Integer totalItems;

    private BigDecimal grandTotal;
}