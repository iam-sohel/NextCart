package com.nextcart.nextcart.product_module.service;

import com.nextcart.nextcart.product_module.dto.ProductDetailsResponse;
import com.nextcart.nextcart.product_module.dto.product.ProductCreateRequest;
import com.nextcart.nextcart.product_module.dto.product.ProductResponse;
import com.nextcart.nextcart.product_module.dto.product.ProductUpdateRequest;

import java.util.List;

public interface ProductService {

    // Create
    ProductResponse createProduct(ProductCreateRequest request);

    // Get product by ID
    ProductResponse getProductById(Long id);

    // Get complete product details
    ProductDetailsResponse getProductDetails(Long productId);

    // Get all products
    List<ProductResponse> getAllProducts();

    // Get products by category
    List<ProductResponse> getProductsByCategory(Long categoryId);

    // Get products by subcategory
    List<ProductResponse> getProductsBySubCategory(Long subCategoryId);

    // Search products
    List<ProductResponse> searchProducts(String keyword);

    // Filter products
    List<ProductResponse> filterProducts(
            Long categoryId,
            Long subCategoryId,
            String keyword
    );

    // Update
    ProductResponse updateProduct(
            Long id,
            ProductUpdateRequest request
    );

    // Delete
    void deleteProduct(Long id);
}