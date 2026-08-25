package com.nextcart.nextcart.inventory_module.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InventoryCreateRequest {

    @NotNull(message = "Product variant id is required")
    private Long productVariantId;

    @NotNull(message = "Available stock is required")
    @PositiveOrZero(message = "Available stock cannot be negative")
    private Integer availableStock;
}