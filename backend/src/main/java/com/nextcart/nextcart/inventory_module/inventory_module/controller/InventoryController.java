package com.nextcart.nextcart.inventory_module.controller;

import com.nextcart.nextcart.inventory_module.dto.InventoryCreateRequest;
import com.nextcart.nextcart.inventory_module.dto.InventoryResponse;
import com.nextcart.nextcart.inventory_module.dto.InventoryUpdateRequest;
import com.nextcart.nextcart.inventory_module.service.InventoryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;


    // =========================
    // CREATE INVENTORY
    // =========================

    @PostMapping
    public ResponseEntity<InventoryResponse> createInventory(
            @Valid @RequestBody InventoryCreateRequest request) {

        InventoryResponse response =
                inventoryService.createInventory(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================
    // GET INVENTORY BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<InventoryResponse> getInventoryById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                inventoryService.getInventoryById(id)
        );
    }


    // =========================
    // GET INVENTORY BY VARIANT
    // =========================

    @GetMapping("/variant/{variantId}")
    public ResponseEntity<InventoryResponse>
    getInventoryByVariantId(
            @PathVariable Long variantId) {

        return ResponseEntity.ok(
                inventoryService.getInventoryByVariantId(
                        variantId
                )
        );
    }


    // =========================
    // GET ALL INVENTORIES
    // =========================

    @GetMapping
    public ResponseEntity<List<InventoryResponse>>
    getAllInventories() {

        return ResponseEntity.ok(
                inventoryService.getAllInventories()
        );
    }


    // =========================
    // UPDATE INVENTORY
    // =========================

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


    // =========================
    // DELETE INVENTORY
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInventory(
            @PathVariable Long id) {

        inventoryService.deleteInventory(id);

        return ResponseEntity.noContent().build();
    }
}