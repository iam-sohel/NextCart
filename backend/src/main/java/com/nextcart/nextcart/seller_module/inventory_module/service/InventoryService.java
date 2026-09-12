package com.nextcart.nextcart.seller_module.inventory_module.service;

import com.nextcart.nextcart.seller_module.inventory_module.dto.InventoryCreateRequest;
import com.nextcart.nextcart.seller_module.inventory_module.dto.InventoryResponse;
import com.nextcart.nextcart.seller_module.inventory_module.dto.InventoryUpdateRequest;

public interface InventoryService {

    InventoryResponse createInventory(Long userId, InventoryCreateRequest request);

    InventoryResponse getInventoryByWarehouse(Long userId, Long warehouseId);

    InventoryResponse updateInventoryItem(Long userId, Long inventoryItemId, InventoryUpdateRequest request);

    void deleteInventoryItem(Long userId, Long inventoryItemId);

    Integer getTotalAvailableStock(Long productVariantId);

    // New warehouse-aware stock operations
    void addStock(Long warehouseId, Long productVariantId, Integer quantity);

    void reserveStock(Long warehouseId, Long productVariantId, Integer quantity);

    void releaseStock(Long warehouseId, Long productVariantId, Integer quantity);

    void deductStock(Long warehouseId, Long productVariantId, Integer quantity);

    void restoreStock(Long warehouseId, Long productVariantId, Integer quantity);

    // Backward-compatible operations for existing OrderService callers.
    // These select an inventory item for the variant internally.
    void addStock(Long productVariantId, Integer quantity);

    void reserveStock(Long productVariantId, Integer quantity);

    void releaseStock(Long productVariantId, Integer quantity);

    void deductStock(Long productVariantId, Integer quantity);

    void restoreStock(Long productVariantId, Integer quantity);
}
