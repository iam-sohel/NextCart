package com.nextcart.nextcart.product_module.product_base;

import com.nextcart.nextcart.adcommon.dto.ApiResponse;
import com.nextcart.nextcart.product_module.product_base.dto.ProductCreateRequest;
import com.nextcart.nextcart.product_module.product_base.dto.ProductDetailsResponse;
import com.nextcart.nextcart.product_module.product_base.dto.ProductResponse;
import com.nextcart.nextcart.product_module.product_base.dto.ProductUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // =========================================================
    // CREATE
    // ADMIN + SELLER
    // =========================================================

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody ProductCreateRequest request) {

        ProductResponse response =
                productService.createProduct(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Product created successfully",
                        response
                ));
    }

    // =========================================================
    // GET BY ID
    // PUBLIC
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(
            @PathVariable Long id) {

        ProductResponse response =
                productService.getProductById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET BY SLUG
    // PUBLIC
    // =========================================================

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductBySlug(
            @PathVariable String slug) {

        ProductResponse response =
                productService.getProductBySlug(slug);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET ALL
    // PUBLIC
    // =========================================================

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductDetailsResponse>>>
    getAllProducts(
            @PageableDefault(
                    size = 20,
                    sort = "name",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable) {

        Page<ProductDetailsResponse> response =
                productService.getAllProducts(pageable);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Products fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET BY CATEGORY
    // PUBLIC
    // =========================================================

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>>
    getProductsByCategory(
            @PathVariable Long categoryId,
            @PageableDefault(
                    size = 20,
                    sort = "name",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable) {

        Page<ProductResponse> response =
                productService.getProductsByCategory(
                        categoryId,
                        pageable
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Products fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET BY SUBCATEGORY
    // PUBLIC
    // =========================================================

    @GetMapping("/subcategory/{subCategoryId}")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>>
    getProductsBySubCategory(
            @PathVariable Long subCategoryId,
            @PageableDefault(
                    size = 20,
                    sort = "name",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable) {

        Page<ProductResponse> response =
                productService.getProductsBySubCategory(
                        subCategoryId,
                        pageable
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Products fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET BY BRAND
    // PUBLIC
    // =========================================================

    @GetMapping("/brand/{brandId}")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>>
    getProductsByBrand(
            @PathVariable Long brandId,
            @PageableDefault(
                    size = 20,
                    sort = "name",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable) {

        Page<ProductResponse> response =
                productService.getProductsByBrand(
                        brandId,
                        pageable
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Products fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // UPDATE
    // ADMIN + SELLER
    //
    // Service must verify:
    // ADMIN  -> any product
    // SELLER -> own product only
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request) {

        ProductResponse response =
                productService.updateProduct(
                        id,
                        request
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product updated successfully",
                        response
                )
        );
    }

    // =========================================================
    // DEACTIVATE
    // ADMIN + SELLER
    //
    // Service must verify ownership for SELLER.
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<Void>> deactivateProduct(
            @PathVariable Long id) {

        productService.deactivateProduct(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product deactivated successfully",
                        null
                )
        );
    }

    // =========================================================
    // RESTORE
    // ADMIN + SELLER
    //
    // Service must verify ownership for SELLER.
    // =========================================================

    @PatchMapping("/{id}/restore")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<ProductResponse>> restoreProduct(
            @PathVariable Long id) {

        ProductResponse response =
                productService.restoreProduct(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product restored successfully",
                        response
                )
        );
    }


    @GetMapping("/{id}/details")
    public ResponseEntity<ApiResponse<ProductDetailsResponse>> getProductDetailsById(
            @PathVariable Long id) {

        ProductDetailsResponse response =
                productService.getProductDetailsById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product details fetched successfully",
                        response
                )
        );
    }
    @GetMapping("/slug/{slug}/details")
    public ResponseEntity<ApiResponse<ProductDetailsResponse>> getProductDetailsBySlug(
            @PathVariable String slug) {

        ProductDetailsResponse response =
                productService.getProductDetailsBySlug(slug);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product details fetched successfully",
                        response
                )
        );
    }
}