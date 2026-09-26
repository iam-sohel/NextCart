package com.nextcart.nextcart.product_module.productImage.controller;

import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.product_module.productImage.service.ProductImageService;
import com.nextcart.nextcart.product_module.productImage.dto.ProductImageCreateRequest;
import com.nextcart.nextcart.product_module.productImage.dto.ProductImageResponse;
import com.nextcart.nextcart.product_module.productImage.dto.ProductImageUpdateRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/product-images")
@RequiredArgsConstructor
public class ProductImageController {

    private final ProductImageService productImageService;

    // =========================================================
    // CREATE IMAGE
    // =========================================================

    @PostMapping
    public ResponseEntity<CommonResponseDto<ProductImageResponse>> createImage(
            @Valid @RequestBody ProductImageCreateRequest request) {

        ProductImageResponse response =
                productImageService.createImage(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new CommonResponseDto<>(
                                true,
                                "Product image created successfully",
                                response
                        )
                );
    }

    // =========================================================
    // GET IMAGE BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<CommonResponseDto<ProductImageResponse>> getImageById(
            @PathVariable Long id) {

        ProductImageResponse response =
                productImageService.getImageById(id);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Product image fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET ALL IMAGES
    // =========================================================

    @GetMapping
    public ResponseEntity<CommonResponseDto<List<ProductImageResponse>>>
    getAllImages() {

        List<ProductImageResponse> response =
                productImageService.getAllImages();

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Product images fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET IMAGES BY PRODUCT
    // =========================================================

    @GetMapping("/product/{productId}")
    public ResponseEntity<CommonResponseDto<List<ProductImageResponse>>>
    getImagesByProductId(
            @PathVariable Long productId) {

        List<ProductImageResponse> response =
                productImageService.getImagesByProductId(productId);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Product images fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // UPDATE IMAGE
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<CommonResponseDto<ProductImageResponse>> updateImage(
            @PathVariable Long id,
            @Valid @RequestBody ProductImageUpdateRequest request) {

        ProductImageResponse response =
                productImageService.updateImage(id, request);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Product image updated successfully",
                        response
                )
        );
    }

    // =========================================================
    // DELETE IMAGE
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<CommonResponseDto<Void>> deleteImage(
            @PathVariable Long id) {

        productImageService.deleteImage(id);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Product image deleted successfully",
                        null
                )
        );
    }
}