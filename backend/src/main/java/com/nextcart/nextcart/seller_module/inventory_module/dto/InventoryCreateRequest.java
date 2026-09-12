package com.nextcart.nextcart.seller_module.inventory_module.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryCreateRequest {

    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;

    @NotNull(message = "Product variant ID is required")
    private Long productVariantId;

    @NotNull(message = "Available stock is required")
    @PositiveOrZero(message = "Available stock cannot be negative")
    private Integer availableStock;
}