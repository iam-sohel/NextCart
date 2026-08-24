package com.nextcart.nextcart.product_module.product_base;

import com.nextcart.nextcart.product_module.product_base.dto.ProductCreateRequest;
import com.nextcart.nextcart.product_module.product_base.dto.ProductResponse;
import com.nextcart.nextcart.product_module.product_base.dto.ProductUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {

    // Create
    ProductResponse createProduct(ProductCreateRequest request);

    // Get single product
    ProductResponse getProductById(Long id);

    // Get single active product by seller-provided slug
    ProductResponse getProductBySlug(String slug);

    // Get all active products with pagination
    Page<ProductResponse> getAllProducts(Pageable pageable);

    // Filter active products
    Page<ProductResponse> getProductsByCategory(
            Long categoryId,
            Pageable pageable
    );

    Page<ProductResponse> getProductsBySubCategory(
            Long subCategoryId,
            Pageable pageable
    );

    Page<ProductResponse> getProductsByBrand(
            Long brandId,
            Pageable pageable
    );

    // Update
    ProductResponse updateProduct(
            Long id,
            ProductUpdateRequest request
    );

    // Soft delete
    void deactivateProduct(Long id);

    // Restore
    ProductResponse restoreProduct(Long id);
}