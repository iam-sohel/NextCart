package com.gesmio.havlook.seller_module.inventory_module.service;

import com.gesmio.havlook.seller_module.inventory_module.dto.InventoryCreateRequest;
import com.gesmio.havlook.seller_module.inventory_module.dto.InventoryItemResponse;
import com.gesmio.havlook.seller_module.inventory_module.dto.InventoryResponse;
import com.gesmio.havlook.seller_module.inventory_module.dto.InventoryUpdateRequest;

import java.util.List;

public interface InventoryService {

    // Seller inventory management

    InventoryResponse createInventory(
            Long userId,
            InventoryCreateRequest request);

    InventoryResponse getInventoryByWarehouse(
            Long userId,
            Long warehouseId);

    InventoryResponse updateInventoryItem(
            Long userId,
            Long inventoryItemId,
            InventoryUpdateRequest request);

    void deleteInventoryItem(
            Long userId,
            Long inventoryItemId);

    // Existing global inventory lookup methods.
    // Preserve these for existing internal callers.

    List<InventoryItemResponse> getInventoryItemsByProductVariantId(
            Long productVariantId);

    Integer getTotalAvailableStock(
            Long productVariantId);

    // Seller-scoped inventory lookup methods.

    List<InventoryItemResponse>
    getInventoryItemsByProductVariantIdForSeller(
            Long userId,
            Long productVariantId);

    Integer getTotalAvailableStockForSeller(
            Long userId,
            Long productVariantId);

    // Warehouse-aware stock operations

    void addStock(
            Long warehouseId,
            Long productVariantId,
            Integer quantity);

    void reserveStock(
            Long warehouseId,
            Long productVariantId,
            Integer quantity);

    void releaseStock(
            Long warehouseId,
            Long productVariantId,
            Integer quantity);

    void deductStock(
            Long warehouseId,
            Long productVariantId,
            Integer quantity);

    void restoreStock(
            Long warehouseId,
            Long productVariantId,
            Integer quantity);

    // Backward-compatible methods used by OrderService.
    // Do not remove without checking all existing callers.

    void addStock(
            Long productVariantId,
            Integer quantity);

    void reserveStock(
            Long productVariantId,
            Integer quantity);

    void releaseStock(
            Long productVariantId,
            Integer quantity);

    void deductStock(
            Long productVariantId,
            Integer quantity);

    void restoreStock(
            Long productVariantId,
            Integer quantity);
}