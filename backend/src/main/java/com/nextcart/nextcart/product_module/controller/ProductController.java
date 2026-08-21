package com.nextcart.nextcart.product_module.controller;

import com.nextcart.nextcart.product_module.dto.ProductDetailsResponse;
import com.nextcart.nextcart.product_module.dto.product.ProductCreateRequest;
import com.nextcart.nextcart.product_module.dto.product.ProductResponse;
import com.nextcart.nextcart.product_module.dto.product.ProductUpdateRequest;
import com.nextcart.nextcart.product_module.service.ProductService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;


    // =========================
    // CREATE PRODUCT
    // =========================

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductCreateRequest request) {

        ProductResponse response =
                productService.createProduct(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================
    // GET PRODUCT BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                productService.getProductById(id)
        );
    }


    // =========================
    // GET ALL PRODUCTS
    // =========================

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {

        return ResponseEntity.ok(
                productService.getAllProducts()
        );
    }


    // =========================
    // GET PRODUCTS BY CATEGORY
    // =========================

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductResponse>>
    getProductsByCategory(
            @PathVariable Long categoryId) {

        return ResponseEntity.ok(
                productService.getProductsByCategory(categoryId)
        );
    }


    // =========================
    // GET PRODUCTS BY SUBCATEGORY
    // =========================

    @GetMapping("/subcategory/{subCategoryId}")
    public ResponseEntity<List<ProductResponse>>
    getProductsBySubCategory(
            @PathVariable Long subCategoryId) {

        return ResponseEntity.ok(
                productService.getProductsBySubCategory(
                        subCategoryId
                )
        );
    }


    // =========================
    // SEARCH PRODUCTS
    // =========================

    @GetMapping("/search")
    public ResponseEntity<List<ProductResponse>>
    searchProducts(
            @RequestParam String keyword) {

        return ResponseEntity.ok(
                productService.searchProducts(keyword)
        );
    }


    // =========================
    // FILTER PRODUCTS
    // =========================

    @GetMapping("/filter")
    public ResponseEntity<List<ProductResponse>>
    filterProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long subCategoryId,
            @RequestParam(required = false) String keyword) {

        return ResponseEntity.ok(
                productService.filterProducts(
                        categoryId,
                        subCategoryId,
                        keyword
                )
        );
    }


    // =========================
    // UPDATE PRODUCT
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request) {

        return ResponseEntity.ok(
                productService.updateProduct(id, request)
        );
    }


    // =========================
    // DELETE PRODUCT
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id) {

        productService.deleteProduct(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{productId}/details")
    public ResponseEntity<ProductDetailsResponse> getProductDetails(
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                productService.getProductDetails(productId)
        );
    }
}