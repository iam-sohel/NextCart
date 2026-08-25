package com.nextcart.nextcart.inventory_module;

import com.nextcart.nextcart.inventory_module.dto.InventoryResponse;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;
import org.springframework.stereotype.Component;

@Component
public class InventoryMapper {

    /**
     * Convert InventoryEntity to InventoryResponse.
     *
     * ProductVariant is obtained from InventoryEntity because
     * inventory belongs to a specific product variant.
     */
    public InventoryResponse toResponse(
            InventoryEntity inventory) {

        if (inventory == null) {
            return null;
        }

        ProductVariantEntity variant =
                inventory.getProductVariant();

        return mapInventory(
                inventory,
                variant
        );
    }

    /**
     * Convert inventory + product variant to response.
     */
    public InventoryResponse mapInventory(
            InventoryEntity inventory,
            ProductVariantEntity variant) {

        if (inventory == null) {
            return null;
        }

        if (variant == null) {
            return null;
        }

        return InventoryResponse.builder()
                .id(inventory.getId())
                .productVariantId(
                        variant.getId()
                )
                .sku(
                        variant.getSku()
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