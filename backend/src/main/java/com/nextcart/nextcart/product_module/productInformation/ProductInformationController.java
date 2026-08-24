package com.nextcart.nextcart.product_module.productInformation;

import com.nextcart.nextcart.adcommon.dto.ApiResponse;
import com.nextcart.nextcart.product_module.productInformation.productInformation.ProductInformationCreateRequest;
import com.nextcart.nextcart.product_module.productInformation.productInformation.ProductInformationResponse;
import com.nextcart.nextcart.product_module.productInformation.productInformation.ProductInformationUpdateRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/product-information")
@RequiredArgsConstructor
public class ProductInformationController {

    private final ProductInformationService productInformationService;

    // =========================================================
    // CREATE
    // =========================================================

    @PostMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<ProductInformationResponse>>
    createInformation(
            @PathVariable Long productId,
            @Valid @RequestBody ProductInformationCreateRequest request) {

        ProductInformationResponse response =
                productInformationService.createInformation(
                        productId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Product information created successfully",
                        response
                ));
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<ProductInformationResponse>>
    getInformationById(
            @PathVariable Long id) {

        ProductInformationResponse response =
                productInformationService.getInformationById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product information fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET BY PRODUCT
    // =========================================================

    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<ProductInformationResponse>>
    getInformationByProductId(
            @PathVariable Long productId) {

        ProductInformationResponse response =
                productInformationService
                        .getInformationByProductId(productId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product information fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<ProductInformationResponse>>
    updateInformation(
            @PathVariable Long id,
            @Valid @RequestBody ProductInformationUpdateRequest request) {

        ProductInformationResponse response =
                productInformationService.updateInformation(
                        id,
                        request
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product information updated successfully",
                        response
                )
        );
    }

    // =========================================================
    // DELETE
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<Void>>
    deleteInformation(
            @PathVariable Long id) {

        productInformationService.deleteInformation(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product information deleted successfully",
                        null
                )
        );
    }
}