package com.nextcart.nextcart.inventory_module;

import com.nextcart.nextcart.inventory_module.dto.InventoryCreateRequest;
import com.nextcart.nextcart.inventory_module.dto.InventoryResponse;
import com.nextcart.nextcart.inventory_module.dto.InventoryUpdateRequest;

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

