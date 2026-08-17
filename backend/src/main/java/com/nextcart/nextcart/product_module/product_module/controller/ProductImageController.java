package com.nextcart.nextcart.product_module.controller;

import com.nextcart.nextcart.product_module.dto.productImage.ProductImageCreateRequest;
import com.nextcart.nextcart.product_module.dto.productImage.ProductImageResponse;
import com.nextcart.nextcart.product_module.dto.productImage.ProductImageUpdateRequest;
import com.nextcart.nextcart.product_module.service.ProductImageService;

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


    // =========================
    // CREATE IMAGE
    // =========================

    @PostMapping
    public ResponseEntity<ProductImageResponse> createImage(
            @Valid @RequestBody ProductImageCreateRequest request) {

        ProductImageResponse response =
                productImageService.createImage(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================
    // GET IMAGE BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<ProductImageResponse> getImageById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                productImageService.getImageById(id)
        );
    }


    // =========================
    // GET ALL IMAGES
    // =========================

    @GetMapping
    public ResponseEntity<List<ProductImageResponse>>
    getAllImages() {

        return ResponseEntity.ok(
                productImageService.getAllImages()
        );
    }


    // =========================
    // GET IMAGES BY PRODUCT
    // =========================

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductImageResponse>>
    getImagesByProductId(
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                productImageService.getImagesByProductId(
                        productId
                )
        );
    }


    // =========================
    // UPDATE IMAGE
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<ProductImageResponse> updateImage(
            @PathVariable Long id,
            @Valid @RequestBody ProductImageUpdateRequest request) {

        return ResponseEntity.ok(
                productImageService.updateImage(
                        id,
                        request
                )
        );
    }


    // =========================
    // DELETE IMAGE
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long id) {

        productImageService.deleteImage(id);

        return ResponseEntity.noContent().build();
    }
}