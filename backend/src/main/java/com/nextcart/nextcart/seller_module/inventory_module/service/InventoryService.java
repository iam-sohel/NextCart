package com.nextcart.nextcart.seller_module.inventory_module.service;

import com.nextcart.nextcart.seller_module.inventory_module.dto.InventoryCreateRequest;
import com.nextcart.nextcart.seller_module.inventory_module.dto.InventoryItemResponse;
import com.nextcart.nextcart.seller_module.inventory_module.dto.InventoryResponse;
import com.nextcart.nextcart.seller_module.inventory_module.dto.InventoryUpdateRequest;

import java.util.List;

public interface InventoryService {

    // =========================================================
    // SELLER INVENTORY MANAGEMENT
    // =========================================================

    InventoryResponse createInventory(
            Long userId,
            InventoryCreateRequest request
    );

    InventoryResponse getInventoryByWarehouse(
            Long userId,
            Long warehouseId
    );

    InventoryResponse updateInventoryItem(
            Long userId,
            Long inventoryItemId,
            InventoryUpdateRequest request
    );

    void deleteInventoryItem(
            Long userId,
            Long inventoryItemId
    );

    // =========================================================
    // INVENTORY LOOKUP
    // =========================================================

    List<InventoryItemResponse> getInventoryItemsByProductVariantId(
            Long productVariantId
    );

    Integer getTotalAvailableStock(
            Long productVariantId
    );

    // =========================================================
    // WAREHOUSE-AWARE STOCK OPERATIONS
    // =========================================================

    void addStock(
            Long warehouseId,
            Long productVariantId,
            Integer quantity
    );

    void reserveStock(
            Long warehouseId,
            Long productVariantId,
            Integer quantity
    );

    void releaseStock(
            Long warehouseId,
            Long productVariantId,
            Integer quantity
    );

    void deductStock(
            Long warehouseId,
            Long productVariantId,
            Integer quantity
    );

    void restoreStock(
            Long warehouseId,
            Long productVariantId,
            Integer quantity
    );

    // =========================================================
    // BACKWARD-COMPATIBLE METHODS
    // =========================================================
    //
    // Existing OrderService currently uses these methods.
    // Do NOT remove them yet.
    //
    // These methods internally select an appropriate inventory
    // item for the product variant.
    // =========================================================

    void addStock(
            Long productVariantId,
            Integer quantity
    );

    void reserveStock(
            Long productVariantId,
            Integer quantity
    );

    void releaseStock(
            Long productVariantId,
            Integer quantity
    );

    void deductStock(
            Long productVariantId,
            Integer quantity
    );

    void restoreStock(
            Long productVariantId,
            Integer quantity
    );
}