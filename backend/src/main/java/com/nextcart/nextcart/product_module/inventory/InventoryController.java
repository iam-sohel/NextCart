package com.nextcart.nextcart.product_module.inventory;

import com.nextcart.nextcart.product_module.inventory.dto.InventoryCreateRequest;
import com.nextcart.nextcart.product_module.inventory.dto.InventoryResponse;
import com.nextcart.nextcart.product_module.inventory.dto.InventoryUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(
            InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping
    public ResponseEntity<InventoryResponse> createInventory(
            @Valid @RequestBody InventoryCreateRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(inventoryService.createInventory(request));
    }

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
                inventoryService
                        .getInventoryByProductVariantId(productVariantId)
        );
    }

    @PutMapping("/{id}")
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInventory(
            @PathVariable Long id) {

        inventoryService.deleteInventory(id);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/variant/{productVariantId}/add-stock")
    public ResponseEntity<Void> addStock(
            @PathVariable Long productVariantId,
            @RequestParam Integer quantity) {

        inventoryService.addStock(
                productVariantId,
                quantity
        );

        return ResponseEntity.ok().build();
    }

    @PostMapping("/variant/{productVariantId}/reserve")
    public ResponseEntity<Void> reserveStock(
            @PathVariable Long productVariantId,
            @RequestParam Integer quantity) {

        inventoryService.reserveStock(
                productVariantId,
                quantity
        );

        return ResponseEntity.ok().build();
    }

    @PostMapping("/variant/{productVariantId}/release")
    public ResponseEntity<Void> releaseStock(
            @PathVariable Long productVariantId,
            @RequestParam Integer quantity) {

        inventoryService.releaseStock(
                productVariantId,
                quantity
        );

        return ResponseEntity.ok().build();
    }

    @PostMapping("/variant/{productVariantId}/deduct")
    public ResponseEntity<Void> deductStock(
            @PathVariable Long productVariantId,
            @RequestParam Integer quantity) {

        inventoryService.deductStock(
                productVariantId,
                quantity
        );

        return ResponseEntity.ok().build();
    }
}