package com.gesmio.havlook.seller_module.inventory_module.controller;

import com.gesmio.havlook.auth_module.security.CustomUserDetails;
import com.gesmio.havlook.common.dto.CommonResponseDto;
import com.gesmio.havlook.seller_module.inventory_module.dto.InventoryCreateRequest;
import com.gesmio.havlook.seller_module.inventory_module.dto.InventoryItemResponse;
import com.gesmio.havlook.seller_module.inventory_module.dto.InventoryResponse;
import com.gesmio.havlook.seller_module.inventory_module.dto.InventoryUpdateRequest;
import com.gesmio.havlook.seller_module.inventory_module.service.InventoryService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sellers/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SELLER')")
public class SellerInventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    public ResponseEntity<CommonResponseDto<InventoryResponse>>
    createInventory(
            Authentication authentication,
            @RequestBody InventoryCreateRequest request) {

        Long userId = getUserId(authentication);

        InventoryResponse response =
                inventoryService.createInventory(userId, request);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Inventory item created successfully",
                        response));
    }

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<CommonResponseDto<InventoryResponse>>
    getInventoryByWarehouse(
            Authentication authentication,
            @PathVariable Long warehouseId) {

        Long userId = getUserId(authentication);

        InventoryResponse response =
                inventoryService.getInventoryByWarehouse(
                        userId,
                        warehouseId);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Inventory fetched successfully",
                        response));
    }

    @GetMapping("/product-variant/{productVariantId}")
    public ResponseEntity<
            CommonResponseDto<List<InventoryItemResponse>>>
    getInventoryItemsByProductVariant(
            Authentication authentication,
            @PathVariable Long productVariantId) {

        Long userId = getUserId(authentication);

        List<InventoryItemResponse> response =
                inventoryService
                        .getInventoryItemsByProductVariantIdForSeller(
                                userId,
                                productVariantId);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Inventory items fetched successfully",
                        response));
    }

    @GetMapping(
            "/product-variant/{productVariantId}/available-stock")
    public ResponseEntity<CommonResponseDto<Integer>>
    getTotalAvailableStock(
            Authentication authentication,
            @PathVariable Long productVariantId) {

        Long userId = getUserId(authentication);

        Integer stock =
                inventoryService.getTotalAvailableStockForSeller(
                        userId,
                        productVariantId);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Available stock fetched successfully",
                        stock));
    }

    @PutMapping("/items/{inventoryItemId}")
    public ResponseEntity<CommonResponseDto<InventoryResponse>>
    updateInventoryItem(
            Authentication authentication,
            @PathVariable Long inventoryItemId,
            @RequestBody InventoryUpdateRequest request) {

        Long userId = getUserId(authentication);

        InventoryResponse response =
                inventoryService.updateInventoryItem(
                        userId,
                        inventoryItemId,
                        request);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Inventory item updated successfully",
                        response));
    }

    @DeleteMapping("/items/{inventoryItemId}")
    public ResponseEntity<CommonResponseDto<Void>>
    deleteInventoryItem(
            Authentication authentication,
            @PathVariable Long inventoryItemId) {

        Long userId = getUserId(authentication);

        inventoryService.deleteInventoryItem(
                userId,
                inventoryItemId);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Inventory item deleted successfully",
                        null));
    }

    private Long getUserId(Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new IllegalStateException(
                    "Authentication required");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof CustomUserDetails userDetails) {
            return userDetails.getUserId();
        }

        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException ex) {
            throw new IllegalStateException(
                    "Unable to determine authenticated user");
        }
    }
}