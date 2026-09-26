package com.nextcart.nextcart.seller_module.inventory_module.controller;

import com.nextcart.nextcart.auth_module.security.CustomUserDetails;
import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.seller_module.inventory_module.dto.InventoryCreateRequest;
import com.nextcart.nextcart.seller_module.inventory_module.dto.InventoryItemResponse;
import com.nextcart.nextcart.seller_module.inventory_module.dto.InventoryResponse;
import com.nextcart.nextcart.seller_module.inventory_module.dto.InventoryUpdateRequest;
import com.nextcart.nextcart.seller_module.inventory_module.service.InventoryService;

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

    // =========================================================
    // CREATE INVENTORY ITEM
    // =========================================================

    @PostMapping
    public ResponseEntity<CommonResponseDto<InventoryResponse>>
    createInventory(
            Authentication authentication,
            @RequestBody InventoryCreateRequest request
    ) {

        Long userId = getUserId(authentication);

        InventoryResponse response =
                inventoryService.createInventory(
                        userId,
                        request
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Inventory item created successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET INVENTORY BY WAREHOUSE
    // =========================================================

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<CommonResponseDto<InventoryResponse>>
    getInventoryByWarehouse(
            Authentication authentication,
            @PathVariable Long warehouseId
    ) {

        Long userId = getUserId(authentication);

        InventoryResponse response =
                inventoryService.getInventoryByWarehouse(
                        userId,
                        warehouseId
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Inventory fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET INVENTORY ITEMS BY PRODUCT VARIANT
    // =========================================================

    @GetMapping("/product-variant/{productVariantId}")
    public ResponseEntity<
            CommonResponseDto<List<InventoryItemResponse>>
            >
    getInventoryItemsByProductVariant(
            @PathVariable Long productVariantId
    ) {

        List<InventoryItemResponse> response =
                inventoryService.getInventoryItemsByProductVariantId(
                        productVariantId
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Inventory items fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET TOTAL AVAILABLE STOCK
    // =========================================================

    @GetMapping("/product-variant/{productVariantId}/available-stock")
    public ResponseEntity<CommonResponseDto<Integer>>
    getTotalAvailableStock(
            @PathVariable Long productVariantId
    ) {

        Integer stock =
                inventoryService.getTotalAvailableStock(
                        productVariantId
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Available stock fetched successfully",
                        stock
                )
        );
    }

    // =========================================================
    // UPDATE INVENTORY ITEM
    // =========================================================

    @PutMapping("/items/{inventoryItemId}")
    public ResponseEntity<CommonResponseDto<InventoryResponse>>
    updateInventoryItem(
            Authentication authentication,
            @PathVariable Long inventoryItemId,
            @RequestBody InventoryUpdateRequest request
    ) {

        Long userId = getUserId(authentication);

        InventoryResponse response =
                inventoryService.updateInventoryItem(
                        userId,
                        inventoryItemId,
                        request
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Inventory item updated successfully",
                        response
                )
        );
    }

    // =========================================================
    // DELETE INVENTORY ITEM
    // =========================================================

    @DeleteMapping("/items/{inventoryItemId}")
    public ResponseEntity<CommonResponseDto<Void>>
    deleteInventoryItem(
            Authentication authentication,
            @PathVariable Long inventoryItemId
    ) {

        Long userId = getUserId(authentication);

        inventoryService.deleteInventoryItem(
                userId,
                inventoryItemId
        );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Inventory item deleted successfully",
                        null
                )
        );
    }

    // =========================================================
    // GET USER ID FROM JWT
    // =========================================================

    private Long getUserId(
            Authentication authentication
    ) {

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new IllegalStateException(
                    "Authentication required"
            );
        }

        Object principal =
                authentication.getPrincipal();

        if (principal instanceof CustomUserDetails userDetails) {

            return userDetails.getUserId();
        }

        try {

            return Long.parseLong(
                    authentication.getName()
            );

        } catch (NumberFormatException ex) {

            throw new IllegalStateException(
                    "Unable to determine authenticated user"
            );
        }
    }
}