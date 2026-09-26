package com.nextcart.nextcart.product_module.product_base.controller;

import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.product_module.product_base.dto.ProductCreateRequest;
import com.nextcart.nextcart.product_module.product_base.dto.ProductDetailsResponse;
import com.nextcart.nextcart.product_module.product_base.dto.ProductResponse;
import com.nextcart.nextcart.product_module.product_base.dto.ProductUpdateRequest;
import com.nextcart.nextcart.product_module.product_base.service.ProductService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;


    // =========================================================
    // CREATE PRODUCT
    // ADMIN + SELLER
    // =========================================================

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<CommonResponseDto<ProductResponse>> createProduct(
            @Valid @RequestBody ProductCreateRequest request
    ) {

        ProductResponse response =
                productService.createProduct(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new CommonResponseDto<>(
                                true,
                                "Product created successfully",
                                response
                        )
                );
    }


    // =========================================================
    // GET PRODUCT BY ID
    // PUBLIC
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<CommonResponseDto<ProductResponse>> getProductById(
            @PathVariable Long id
    ) {

        ProductResponse response =
                productService.getProductById(id);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Product fetched successfully",
                        response
                )
        );
    }


    // =========================================================
    // GET PRODUCT BY SLUG
    // PUBLIC
    // =========================================================

    @GetMapping("/slug/{slug}")
    public ResponseEntity<CommonResponseDto<ProductResponse>> getProductBySlug(
            @PathVariable String slug
    ) {

        ProductResponse response =
                productService.getProductBySlug(slug);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Product fetched successfully",
                        response
                )
        );
    }


    // =========================================================
    // GET ALL PRODUCTS
    // PUBLIC
    // =========================================================

    @GetMapping
    public ResponseEntity<
            CommonResponseDto<Page<ProductDetailsResponse>>
            > getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,asc") String sort
    ) {

        String[] sortParts =
                sort.split(",");

        Sort.Direction direction =
                sortParts.length > 1
                        ? Sort.Direction.fromString(
                        sortParts[1]
                )
                        : Sort.Direction.ASC;

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(
                                direction,
                                sortParts[0]
                        )
                );

        Page<ProductDetailsResponse> response =
                productService.getAllProducts(
                        pageable
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Products retrieved successfully",
                        response
                )
        );
    }


    // =========================================================
    // SEARCH PRODUCTS
    // PUBLIC
    //
    // Returns plain list.
    // Frontend handles filtering/sorting/pagination.
    // =========================================================

    @GetMapping("/search")
    public ResponseEntity<
            CommonResponseDto<List<ProductResponse>>
            > searchProducts(
            @RequestParam("keyword") String keyword
    ) {

        List<ProductResponse> response =
                productService.searchProducts(keyword);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Products fetched successfully",
                        response
                )
        );
    }


    // =========================================================
    // GET PRODUCTS BY CATEGORY
    // PUBLIC
    // =========================================================

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<
            CommonResponseDto<Page<ProductResponse>>
            > getProductsByCategory(
            @PathVariable Long categoryId,
            @PageableDefault(
                    size = 20,
                    sort = "name",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable
    ) {

        Page<ProductResponse> response =
                productService.getProductsByCategory(
                        categoryId,
                        pageable
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Products fetched successfully",
                        response
                )
        );
    }


    // =========================================================
    // GET PRODUCTS BY SUBCATEGORY
    // PUBLIC
    // =========================================================

    @GetMapping("/subcategory/{subCategoryId}")
    public ResponseEntity<
            CommonResponseDto<Page<ProductResponse>>
            > getProductsBySubCategory(
            @PathVariable Long subCategoryId,
            @PageableDefault(
                    size = 20,
                    sort = "name",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable
    ) {

        Page<ProductResponse> response =
                productService.getProductsBySubCategory(
                        subCategoryId,
                        pageable
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Products fetched successfully",
                        response
                )
        );
    }


    // =========================================================
    // GET PRODUCTS BY BRAND
    // PUBLIC
    // =========================================================

    @GetMapping("/brand/{brandId}")
    public ResponseEntity<
            CommonResponseDto<Page<ProductResponse>>
            > getProductsByBrand(
            @PathVariable Long brandId,
            @PageableDefault(
                    size = 20,
                    sort = "name",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable
    ) {

        Page<ProductResponse> response =
                productService.getProductsByBrand(
                        brandId,
                        pageable
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Products fetched successfully",
                        response
                )
        );
    }


    // =========================================================
    // UPDATE PRODUCT
    // ADMIN + SELLER
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<
            CommonResponseDto<ProductResponse>
            > updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request
    ) {

        ProductResponse response =
                productService.updateProduct(
                        id,
                        request
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Product updated successfully",
                        response
                )
        );
    }


    // =========================================================
    // DEACTIVATE PRODUCT
    // ADMIN + SELLER
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<
            CommonResponseDto<Void>
            > deactivateProduct(
            @PathVariable Long id
    ) {

        productService.deactivateProduct(id);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Product deactivated successfully",
                        null
                )
        );
    }


    // =========================================================
    // RESTORE PRODUCT
    // ADMIN + SELLER
    // =========================================================

    @PatchMapping("/{id}/restore")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<
            CommonResponseDto<ProductResponse>
            > restoreProduct(
            @PathVariable Long id
    ) {

        ProductResponse response =
                productService.restoreProduct(id);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Product restored successfully",
                        response
                )
        );
    }


    // =========================================================
    // GET COMPLETE PRODUCT DETAILS BY ID
    // PUBLIC
    // =========================================================

    @GetMapping("/{id}/details")
    public ResponseEntity<
            CommonResponseDto<ProductDetailsResponse>
            > getProductDetailsById(
            @PathVariable Long id
    ) {

        ProductDetailsResponse response =
                productService.getProductDetailsById(id);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Product details fetched successfully",
                        response
                )
        );
    }


    // =========================================================
    // GET COMPLETE PRODUCT DETAILS BY SLUG
    // PUBLIC
    // =========================================================

    @GetMapping("/slug/{slug}/details")
    public ResponseEntity<
            CommonResponseDto<ProductDetailsResponse>
            > getProductDetailsBySlug(
            @PathVariable String slug
    ) {

        ProductDetailsResponse response =
                productService.getProductDetailsBySlug(slug);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Product details fetched successfully",
                        response
                )
        );
    }
}