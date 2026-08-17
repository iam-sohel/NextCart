package com.nextcart.nextcart.product_module.controller;

import com.nextcart.nextcart.product_module.dto.ProductVariant.ProductVariantCreateRequest;
import com.nextcart.nextcart.product_module.dto.ProductVariant.ProductVariantResponse;
import com.nextcart.nextcart.product_module.dto.ProductVariant.ProductVariantUpdateRequest;
import com.nextcart.nextcart.product_module.service.ProductVariantService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/product-variants")
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantService productVariantService;


    // =========================
    // CREATE VARIANT
    // =========================

    @PostMapping
    public ResponseEntity<ProductVariantResponse> createVariant(
            @Valid @RequestBody ProductVariantCreateRequest request) {

        ProductVariantResponse response =
                productVariantService.createVariant(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================
    // GET VARIANT BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<ProductVariantResponse> getVariantById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                productVariantService.getVariantById(id)
        );
    }


    // =========================
    // GET ALL VARIANTS
    // =========================

    @GetMapping
    public ResponseEntity<List<ProductVariantResponse>>
    getAllVariants() {

        return ResponseEntity.ok(
                productVariantService.getAllVariants()
        );
    }


    // =========================
    // GET VARIANTS BY PRODUCT
    // =========================

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductVariantResponse>>
    getVariantsByProductId(
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                productVariantService
                        .getVariantsByProductId(productId)
        );
    }


    // =========================
    // UPDATE VARIANT
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<ProductVariantResponse> updateVariant(
            @PathVariable Long id,
            @Valid @RequestBody ProductVariantUpdateRequest request) {

        return ResponseEntity.ok(
                productVariantService.updateVariant(
                        id,
                        request
                )
        );
    }


    // =========================
    // DELETE VARIANT
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVariant(
            @PathVariable Long id) {

        productVariantService.deleteVariant(id);

        return ResponseEntity.noContent().build();
    }
}