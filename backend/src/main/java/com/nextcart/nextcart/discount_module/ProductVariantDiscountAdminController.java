package com.nextcart.nextcart.discount_module;

import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.discount_module.dto.ProductVariantDiscountCreateRequest;
import com.nextcart.nextcart.discount_module.dto.ProductVariantDiscountResponse;
import com.nextcart.nextcart.discount_module.dto.ProductVariantDiscountUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/product-variant-discounts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ProductVariantDiscountAdminController {

    private final ProductVariantDiscountService discountService;

    // =========================================================
    // CREATE DISCOUNT
    // =========================================================

    @PostMapping
    public ResponseEntity<CommonResponseDto<ProductVariantDiscountResponse>>
    createDiscount(
            @Valid @RequestBody ProductVariantDiscountCreateRequest request) {

        ProductVariantDiscountResponse response =
                discountService.createDiscount(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new CommonResponseDto<>(
                                true,
                                "Product variant discount created successfully",
                                response
                        )
                );
    }

    // =========================================================
    // GET DISCOUNT BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<CommonResponseDto<ProductVariantDiscountResponse>>
    getDiscountById(
            @PathVariable Long id) {

        ProductVariantDiscountResponse response =
                discountService.getDiscountById(id);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Product variant discount fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET DISCOUNTS BY PRODUCT VARIANT
    // =========================================================

    @GetMapping("/variant/{productVariantId}")
    public ResponseEntity<
            CommonResponseDto<List<ProductVariantDiscountResponse>>>
    getDiscountsByVariant(
            @PathVariable Long productVariantId) {

        List<ProductVariantDiscountResponse> response =
                discountService.getDiscountsByVariant(
                        productVariantId
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Product variant discounts fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // UPDATE DISCOUNT
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<CommonResponseDto<ProductVariantDiscountResponse>>
    updateDiscount(
            @PathVariable Long id,
            @Valid @RequestBody ProductVariantDiscountUpdateRequest request) {

        ProductVariantDiscountResponse response =
                discountService.updateDiscount(
                        id,
                        request
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Product variant discount updated successfully",
                        response
                )
        );
    }

    // =========================================================
    // DEACTIVATE DISCOUNT
    // =========================================================

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<CommonResponseDto<Void>>
    deactivateDiscount(
            @PathVariable Long id) {

        discountService.deactivateDiscount(id);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Product variant discount deactivated successfully",
                        null
                )
        );
    }

    // =========================================================
    // RESTORE DISCOUNT
    // =========================================================

    @PatchMapping("/{id}/restore")
    public ResponseEntity<CommonResponseDto<ProductVariantDiscountResponse>>
    restoreDiscount(
            @PathVariable Long id) {

        ProductVariantDiscountResponse response =
                discountService.restoreDiscount(id);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Product variant discount restored successfully",
                        response
                )
        );
    }
}