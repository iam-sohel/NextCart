package com.nextcart.nextcart.product_module.inventory.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class InventoryResponse {

    private Long id;

    private Long productVariantId;

    private String sku;

    private Integer availableStock;

    private Integer reservedStock;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}