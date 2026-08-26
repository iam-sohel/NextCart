package com.nextcart.nextcart.inventory_module;

import com.nextcart.nextcart.inventory_module.dto.InventoryCreateRequest;
import com.nextcart.nextcart.inventory_module.dto.InventoryResponse;
import com.nextcart.nextcart.inventory_module.dto.InventoryUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    // =========================================================
    // ADMIN - CREATE INVENTORY
    // =========================================================

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryResponse> createInventory(
            @Valid @RequestBody InventoryCreateRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(inventoryService.createInventory(request));
    }

    // =========================================================
    // CUSTOMER / ADMIN - VIEW INVENTORY
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<InventoryResponse> getInventoryById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                inventoryService.getInventoryById(id)
        );
    }

    @GetMapping("/variant/{productVariantId}")
    public ResponseEntity<InventoryResponse>
    getInventoryByProductVariantId(
            @PathVariable Long productVariantId) {

        return ResponseEntity.ok(
                inventoryService.getInventoryByProductVariantId(
                        productVariantId
                )
        );
    }

    // =========================================================
    // ADMIN - UPDATE INVENTORY
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryResponse> updateInventory(
            @PathVariable Long id,
            @Valid @RequestBody InventoryUpdateRequest request) {

        return ResponseEntity.ok(
                inventoryService.updateInventory(
                        id,
                        request
                )
        );
    }

    // =========================================================
    // ADMIN - DELETE INVENTORY
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteInventory(
            @PathVariable Long id) {

        inventoryService.deleteInventory(id);

        return ResponseEntity.noContent().build();
    }
}