package com.nextcart.nextcart.seller_module.inventory_module.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItemResponse {

    private Long id;

    private Long productVariantId;

    private String sku;

    private Integer availableStock;

    private Integer reservedStock;

    private Integer totalStock;

    private String stockStatus;
}