package com.nextcart.nextcart.product_module.inventory;

import com.nextcart.nextcart.product_module.inventory.dto.InventoryResponse;
import org.springframework.stereotype.Component;

@Component
public class InventoryMapper {

    public InventoryResponse toResponse(
            InventoryEntity inventory) {

        return InventoryResponse.builder()
                .id(inventory.getId())
                .productVariantId(
                        inventory.getProductVariant().getId()
                )
                .sku(
                        inventory.getProductVariant().getSku()
                )
                .availableStock(
                        inventory.getAvailableStock()
                )
                .reservedStock(
                        inventory.getReservedStock()
                )
                .createdAt(
                        inventory.getCreatedAt()
                )
                .updatedAt(
                        inventory.getUpdatedAt()
                )
                .build();
    }
}