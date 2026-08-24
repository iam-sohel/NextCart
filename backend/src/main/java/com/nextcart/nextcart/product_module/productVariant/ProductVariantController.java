package com.nextcart.nextcart.product_module.productVariant;

import com.nextcart.nextcart.adcommon.dto.ApiResponse;
import com.nextcart.nextcart.product_module.productVariant.dto.ProductVariantCreateRequest;
import com.nextcart.nextcart.product_module.productVariant.dto.ProductVariantResponse;
import com.nextcart.nextcart.product_module.productVariant.dto.ProductVariantUpdateRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/product-variants")
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantService productVariantService;

    // =========================================================
    // CREATE VARIANT
    // ADMIN + SELLER
    // =========================================================

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<ProductVariantResponse>>
    createVariant(
            @Valid @RequestBody ProductVariantCreateRequest request) {

        ProductVariantResponse response =
                productVariantService.createVariant(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Product variant created successfully",
                        response
                ));
    }

    // =========================================================
    // GET VARIANT BY ID
    // PUBLIC
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductVariantResponse>>
    getVariantById(
            @PathVariable Long id) {

        ProductVariantResponse response =
                productVariantService.getVariantById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product variant fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET VARIANT BY SKU
    // PUBLIC
    // =========================================================

    @GetMapping("/sku/{sku}")
    public ResponseEntity<ApiResponse<ProductVariantResponse>>
    getVariantBySku(
            @PathVariable String sku) {

        ProductVariantResponse response =
                productVariantService.getVariantBySku(sku);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product variant fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET ALL VARIANTS BY PRODUCT
    // ADMIN + SELLER
    // =========================================================

    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<Page<ProductVariantResponse>>>
    getVariantsByProduct(
            @PathVariable Long productId,
            @PageableDefault(size = 20)
            Pageable pageable) {

        Page<ProductVariantResponse> response =
                productVariantService.getVariantsByProduct(
                        productId,
                        pageable
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product variants fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET ACTIVE VARIANTS BY PRODUCT
    // PUBLIC
    // =========================================================

    @GetMapping("/product/{productId}/active")
    public ResponseEntity<ApiResponse<Page<ProductVariantResponse>>>
    getActiveVariantsByProduct(
            @PathVariable Long productId,
            @PageableDefault(size = 20)
            Pageable pageable) {

        Page<ProductVariantResponse> response =
                productVariantService.getActiveVariantsByProduct(
                        productId,
                        pageable
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Active product variants fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // UPDATE VARIANT
    // ADMIN + SELLER
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<ProductVariantResponse>>
    updateVariant(
            @PathVariable Long id,
            @Valid @RequestBody ProductVariantUpdateRequest request) {

        ProductVariantResponse response =
                productVariantService.updateVariant(
                        id,
                        request
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product variant updated successfully",
                        response
                )
        );
    }

    // =========================================================
    // DEACTIVATE VARIANT
    // ADMIN + SELLER
    // =========================================================

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<Void>>
    deactivateVariant(
            @PathVariable Long id) {

        productVariantService.deactivateVariant(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product variant deactivated successfully",
                        null
                )
        );
    }

    // =========================================================
    // RESTORE VARIANT
    // ADMIN + SELLER
    // =========================================================

    @PatchMapping("/{id}/restore")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<ProductVariantResponse>>
    restoreVariant(
            @PathVariable Long id) {

        ProductVariantResponse response =
                productVariantService.restoreVariant(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product variant restored successfully",
                        response
                )
        );
    }
}