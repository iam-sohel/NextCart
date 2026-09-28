package com.nextcart.nextcart.seller_module.warehouse_module.controller;

import com.nextcart.nextcart.auth_module.security.CustomUserDetails;
import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.seller_module.warehouse_module.dto.WarehouseCreateRequest;
import com.nextcart.nextcart.seller_module.warehouse_module.dto.WarehouseResponse;
import com.nextcart.nextcart.seller_module.warehouse_module.dto.WarehouseUpdateRequest;
import com.nextcart.nextcart.seller_module.warehouse_module.service.WarehouseService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sellers/warehouses")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class WarehouseController {

    private final WarehouseService warehouseService;

    // =========================================================
    // CREATE WAREHOUSE
    // =========================================================

    @PostMapping
    public ResponseEntity<CommonResponseDto<WarehouseResponse>> createWarehouse(
            Authentication authentication,
            @Valid @RequestBody WarehouseCreateRequest request
    ) {

        Long userId = getUserId(authentication);

        WarehouseResponse response =
                warehouseService.createWarehouse(
                        userId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new CommonResponseDto<>(
                                true,
                                "Warehouse created successfully",
                                response
                        )
                );
    }

    // =========================================================
    // GET MY WAREHOUSES
    // =========================================================

    @GetMapping
    public ResponseEntity<CommonResponseDto<List<WarehouseResponse>>>
    getMyWarehouses(
            Authentication authentication
    ) {

        Long userId = getUserId(authentication);

        List<WarehouseResponse> response =
                warehouseService.getMyWarehouses(userId);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Warehouses retrieved successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET MY WAREHOUSE
    // =========================================================

    @GetMapping("/{warehouseId}")
    public ResponseEntity<CommonResponseDto<WarehouseResponse>>
    getMyWarehouse(
            Authentication authentication,
            @PathVariable Long warehouseId
    ) {

        Long userId = getUserId(authentication);

        WarehouseResponse response =
                warehouseService.getMyWarehouse(
                        userId,
                        warehouseId
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Warehouse retrieved successfully",
                        response
                )
        );
    }

    // =========================================================
    // UPDATE WAREHOUSE
    // =========================================================

    @PutMapping("/{warehouseId}")
    public ResponseEntity<CommonResponseDto<WarehouseResponse>>
    updateWarehouse(
            Authentication authentication,
            @PathVariable Long warehouseId,
            @Valid @RequestBody WarehouseUpdateRequest request
    ) {

        Long userId = getUserId(authentication);

        WarehouseResponse response =
                warehouseService.updateMyWarehouse(
                        userId,
                        warehouseId,
                        request
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Warehouse updated successfully",
                        response
                )
        );
    }

    // =========================================================
    // DEACTIVATE WAREHOUSE
    // =========================================================

    @PatchMapping("/{warehouseId}/deactivate")
    public ResponseEntity<CommonResponseDto<Void>>
    deactivateWarehouse(
            Authentication authentication,
            @PathVariable Long warehouseId
    ) {

        Long userId = getUserId(authentication);

        warehouseService.deactivateWarehouse(
                userId,
                warehouseId
        );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Warehouse deactivated successfully",
                        null
                )
        );
    }

    // =========================================================
    // GET AUTHENTICATED USER ID
    // =========================================================

    private Long getUserId(
            Authentication authentication
    ) {

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new AccessDeniedException(
                    "Authentication required"
            );
        }

        Object principal =
                authentication.getPrincipal();

        if (principal instanceof CustomUserDetails userDetails) {

            Long userId = userDetails.getUserId();

            if (userId == null || userId <= 0) {
                throw new AccessDeniedException(
                        "Authenticated user ID is invalid"
                );
            }

            return userId;
        }

        try {

            Long userId =
                    Long.valueOf(authentication.getName());

            if (userId <= 0) {
                throw new AccessDeniedException(
                        "Authenticated user ID is invalid"
                );
            }

            return userId;

        } catch (NumberFormatException ex) {

            throw new AccessDeniedException(
                    "Authenticated user ID is invalid"
            );
        }
    }
}