package com.nextcart.nextcart.seller_module.inventory_module.controller;

import com.nextcart.nextcart.seller_module.inventory_module.dto.InventoryCreateRequest;
import com.nextcart.nextcart.seller_module.inventory_module.dto.InventoryItemResponse;
import com.nextcart.nextcart.seller_module.inventory_module.dto.InventoryResponse;
import com.nextcart.nextcart.seller_module.inventory_module.dto.InventoryUpdateRequest;

import java.util.List;

public interface InventoryService {

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

    List<InventoryItemResponse> getInventoryItemsByProductVariantId(
            Long productVariantId
    );

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
}