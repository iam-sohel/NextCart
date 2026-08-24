package com.nextcart.nextcart.product_module.inventory;

import com.nextcart.nextcart.product_module.inventory.dto.InventoryCreateRequest;
import com.nextcart.nextcart.product_module.inventory.dto.InventoryResponse;
import com.nextcart.nextcart.product_module.inventory.dto.InventoryUpdateRequest;

public interface InventoryService {

    InventoryResponse createInventory(InventoryCreateRequest request);

    InventoryResponse getInventoryById(Long id);

    InventoryResponse getInventoryByProductVariantId(Long productVariantId);

    InventoryResponse updateInventory(Long id, InventoryUpdateRequest request);

    void deleteInventory(Long id);

    void addStock(Long productVariantId, Integer quantity);

    void reserveStock(Long productVariantId, Integer quantity);

    void releaseStock(Long productVariantId, Integer quantity);

    void deductStock(Long productVariantId, Integer quantity);
}