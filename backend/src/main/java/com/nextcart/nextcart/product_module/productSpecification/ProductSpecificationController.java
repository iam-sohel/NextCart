package com.nextcart.nextcart.product_module.productSpecification;

import com.nextcart.nextcart.adcommon.dto.ApiResponse;
import com.nextcart.nextcart.product_module.productSpecification.productSpecification.ProductSpecificationCreateRequest;
import com.nextcart.nextcart.product_module.productSpecification.productSpecification.ProductSpecificationResponse;
import com.nextcart.nextcart.product_module.productSpecification.productSpecification.ProductSpecificationUpdateRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/product-specifications")
@RequiredArgsConstructor
public class ProductSpecificationController {

    private final ProductSpecificationService productSpecificationService;

    // =========================================================
    // CREATE SPECIFICATION
    // ADMIN + SELLER
    // =========================================================

    @PostMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<ProductSpecificationResponse>>
    createSpecification(
            @PathVariable Long productId,
            @Valid @RequestBody ProductSpecificationCreateRequest request) {

        ProductSpecificationResponse response =
                productSpecificationService.createSpecification(
                        productId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Product specification created successfully",
                        response
                ));
    }

    // =========================================================
    // GET SPECIFICATION BY ID
    // ADMIN + SELLER
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<ProductSpecificationResponse>>
    getSpecificationById(
            @PathVariable Long id) {

        ProductSpecificationResponse response =
                productSpecificationService.getSpecificationById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product specification fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET SPECIFICATIONS BY PRODUCT
    // ADMIN + SELLER
    // =========================================================

    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<List<ProductSpecificationResponse>>>
    getSpecificationsByProductId(
            @PathVariable Long productId) {

        List<ProductSpecificationResponse> response =
                productSpecificationService
                        .getSpecificationsByProductId(productId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product specifications fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // UPDATE SPECIFICATION
    // ADMIN + SELLER
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<ProductSpecificationResponse>>
    updateSpecification(
            @PathVariable Long id,
            @Valid @RequestBody ProductSpecificationUpdateRequest request) {

        ProductSpecificationResponse response =
                productSpecificationService.updateSpecification(
                        id,
                        request
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product specification updated successfully",
                        response
                )
        );
    }

    // =========================================================
    // DELETE SPECIFICATION
    // ADMIN + SELLER
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<Void>>
    deleteSpecification(
            @PathVariable Long id) {

        productSpecificationService.deleteSpecification(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product specification deleted successfully",
                        null
                )
        );
    }
}