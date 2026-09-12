package com.nextcart.nextcart.seller_module.warehouse_module.service;

import com.nextcart.nextcart.seller_module.warehouse_module.dto.WarehouseCreateRequest;
import com.nextcart.nextcart.seller_module.warehouse_module.dto.WarehouseResponse;
import com.nextcart.nextcart.seller_module.warehouse_module.dto.WarehouseUpdateRequest;

import java.util.List;

public interface WarehouseService {

    WarehouseResponse createWarehouse(
            Long userId,
            WarehouseCreateRequest request
    );

    List<WarehouseResponse> getMyWarehouses(
            Long userId
    );

    WarehouseResponse getMyWarehouse(
            Long userId,
            Long warehouseId
    );

    WarehouseResponse updateMyWarehouse(
            Long userId,
            Long warehouseId,
            WarehouseUpdateRequest request
    );

    void deactivateWarehouse(
            Long userId,
            Long warehouseId
    );
}