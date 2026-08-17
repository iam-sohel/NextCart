package com.nextcart.nextcart.inventory_module.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryResponse {

    private Long id;

    private Long variantId;

    private Integer quantity;

    private Integer reservedQuantity;

    private Integer availableQuantity;

    private String stockStatus;
}