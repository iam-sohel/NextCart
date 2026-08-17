package com.nextcart.nextcart.inventory_module.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InventoryUpdateRequest {

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    @Min(
            value = 0,
            message = "Reserved quantity cannot be negative"
    )
    private Integer reservedQuantity;
}