package com.nextcart.nextcart.inventory_module.service;

import com.nextcart.nextcart.inventory_module.dto.InventoryCreateRequest;
import com.nextcart.nextcart.inventory_module.dto.InventoryResponse;
import com.nextcart.nextcart.inventory_module.dto.InventoryUpdateRequest;

import java.util.List;

public interface InventoryService {

    InventoryResponse createInventory(
            InventoryCreateRequest request
    );

    InventoryResponse getInventoryById(
            Long id
    );

    InventoryResponse getInventoryByVariantId(
            Long variantId
    );

    List<InventoryResponse> getAllInventories();

    InventoryResponse updateInventory(
            Long id,
            InventoryUpdateRequest request
    );

    void deleteInventory(Long id);
}