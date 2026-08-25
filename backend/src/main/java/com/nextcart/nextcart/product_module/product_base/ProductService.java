package com.nextcart.nextcart.product_module.product_base;

import com.nextcart.nextcart.product_module.product_base.dto.ProductCreateRequest;
import com.nextcart.nextcart.product_module.product_base.dto.ProductDetailsResponse;
import com.nextcart.nextcart.product_module.product_base.dto.ProductResponse;
import com.nextcart.nextcart.product_module.product_base.dto.ProductUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {

    // =========================================================
    // CREATE
    // =========================================================

    ProductResponse createProduct(ProductCreateRequest request);


    // =========================================================
    // GET BY ID
    // =========================================================

    ProductResponse getProductById(Long id);


    // =========================================================
    // GET BY SLUG
    // =========================================================

    ProductResponse getProductBySlug(String slug);


    // =========================================================
    // GET COMPLETE PRODUCT DETAILS
    // =========================================================

    ProductDetailsResponse getProductDetailsById(Long id);


    // =========================================================
    // GET ALL
    // =========================================================

    Page<ProductResponse> getAllProducts(Pageable pageable);


    // =========================================================
    // GET BY CATEGORY
    // =========================================================

    Page<ProductResponse> getProductsByCategory(
            Long categoryId,
            Pageable pageable
    );


    // =========================================================
    // GET BY SUBCATEGORY
    // =========================================================

    Page<ProductResponse> getProductsBySubCategory(
            Long subCategoryId,
            Pageable pageable
    );


    // =========================================================
    // GET BY BRAND
    // =========================================================

    Page<ProductResponse> getProductsByBrand(
            Long brandId,
            Pageable pageable
    );


    // =========================================================
    // UPDATE
    // =========================================================

    ProductResponse updateProduct(
            Long id,
            ProductUpdateRequest request
    );


    // =========================================================
    // DEACTIVATE
    // =========================================================

    void deactivateProduct(Long id);


    // =========================================================
    // RESTORE
    // =========================================================

    ProductResponse restoreProduct(Long id);
}