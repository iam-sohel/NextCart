package com.nextcart.nextcart.seller_module.warehouse_module.controller;

import com.nextcart.nextcart.common.dto.ApiResponse;
import com.nextcart.nextcart.seller_module.warehouse_module.dto.WarehouseCreateRequest;
import com.nextcart.nextcart.seller_module.warehouse_module.dto.WarehouseResponse;
import com.nextcart.nextcart.seller_module.warehouse_module.dto.WarehouseUpdateRequest;
import com.nextcart.nextcart.seller_module.warehouse_module.service.WarehouseService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sellers/warehouses")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class WarehouseController {

    private final WarehouseService warehouseService;

    @PostMapping
    public ResponseEntity<ApiResponse<WarehouseResponse>> createWarehouse(
            Authentication authentication,
            @Valid @RequestBody WarehouseCreateRequest request
    ) {

        Long userId =
                Long.valueOf(authentication.getName());

        WarehouseResponse response =
                warehouseService.createWarehouse(
                        userId,
                        request
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Warehouse created successfully",
                        response
                )
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WarehouseResponse>>> getMyWarehouses(
            Authentication authentication
    ) {

        Long userId =
                Long.valueOf(authentication.getName());

        List<WarehouseResponse> response =
                warehouseService.getMyWarehouses(userId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Warehouses retrieved successfully",
                        response
                )
        );
    }

    @GetMapping("/{warehouseId}")
    public ResponseEntity<ApiResponse<WarehouseResponse>> getMyWarehouse(
            Authentication authentication,
            @PathVariable Long warehouseId
    ) {

        Long userId =
                Long.valueOf(authentication.getName());

        WarehouseResponse response =
                warehouseService.getMyWarehouse(
                        userId,
                        warehouseId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Warehouse retrieved successfully",
                        response
                )
        );
    }

    @PutMapping("/{warehouseId}")
    public ResponseEntity<ApiResponse<WarehouseResponse>> updateWarehouse(
            Authentication authentication,
            @PathVariable Long warehouseId,
            @Valid @RequestBody WarehouseUpdateRequest request
    ) {

        Long userId =
                Long.valueOf(authentication.getName());

        WarehouseResponse response =
                warehouseService.updateMyWarehouse(
                        userId,
                        warehouseId,
                        request
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Warehouse updated successfully",
                        response
                )
        );
    }

    @DeleteMapping("/{warehouseId}")
    public ResponseEntity<ApiResponse<Void>> deactivateWarehouse(
            Authentication authentication,
            @PathVariable Long warehouseId
    ) {

        Long userId =
                Long.valueOf(authentication.getName());

        warehouseService.deactivateWarehouse(
                userId,
                warehouseId
        );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Warehouse deactivated successfully",
                        null
                )
        );
    }
}