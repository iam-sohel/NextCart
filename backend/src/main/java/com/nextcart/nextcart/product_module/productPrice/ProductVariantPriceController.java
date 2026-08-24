package com.nextcart.nextcart.product_module.productPrice;

import com.nextcart.nextcart.adcommon.dto.ApiResponse;
import com.nextcart.nextcart.product_module.productPrice.dto.ProductVariantPriceCreateRequest;
import com.nextcart.nextcart.product_module.productPrice.dto.ProductVariantPriceResponse;
import com.nextcart.nextcart.product_module.productPrice.dto.ProductVariantPriceUpdateRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/product-variant-prices")
@RequiredArgsConstructor
public class ProductVariantPriceController {

    private final ProductVariantPriceService priceService;

    // =========================================================
    // CREATE PRICE
    // ADMIN + SELLER
    // =========================================================

    @PostMapping("/variant/{productVariantId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<ProductVariantPriceResponse>>
    createPrice(
            @PathVariable Long productVariantId,
            @Valid @RequestBody ProductVariantPriceCreateRequest request) {

        ProductVariantPriceResponse response =
                priceService.createPrice(
                        productVariantId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Product variant price created successfully",
                        response
                ));
    }

    // =========================================================
    // GET PRICE BY ID
    // PUBLIC
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductVariantPriceResponse>>
    getPriceById(
            @PathVariable Long id) {

        ProductVariantPriceResponse response =
                priceService.getPriceById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product variant price fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET PRICE BY VARIANT
    // PUBLIC
    // =========================================================

    @GetMapping("/variant/{productVariantId}")
    public ResponseEntity<ApiResponse<ProductVariantPriceResponse>>
    getPriceByVariantId(
            @PathVariable Long productVariantId) {

        ProductVariantPriceResponse response =
                priceService.getPriceByVariantId(
                        productVariantId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product variant price fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // UPDATE PRICE
    // ADMIN + SELLER
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<ProductVariantPriceResponse>>
    updatePrice(
            @PathVariable Long id,
            @Valid @RequestBody ProductVariantPriceUpdateRequest request) {

        ProductVariantPriceResponse response =
                priceService.updatePrice(
                        id,
                        request
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product variant price updated successfully",
                        response
                )
        );
    }

    // =========================================================
    // DELETE PRICE
    // ADMIN + SELLER
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<Void>>
    deletePrice(
            @PathVariable Long id) {

        priceService.deletePrice(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product variant price deleted successfully",
                        null
                )
        );
    }
}