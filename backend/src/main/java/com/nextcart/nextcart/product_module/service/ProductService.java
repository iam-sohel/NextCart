package com.nextcart.nextcart.product_module.service;

import com.nextcart.nextcart.product_module.dto.product.ProductCreateRequest;
import com.nextcart.nextcart.product_module.dto.product.ProductResponse;
import com.nextcart.nextcart.product_module.dto.product.ProductUpdateRequest;

import java.util.List;

public interface ProductService {

    ProductResponse createProduct(
            ProductCreateRequest request
    );

    ProductResponse getProductById(
            Long id
    );

    List<ProductResponse> getAllProducts();

    List<ProductResponse> getProductsByCategory(
            Long categoryId
    );

    List<ProductResponse> getProductsBySubCategory(
            Long subCategoryId
    );

    List<ProductResponse> searchProducts(
            String keyword
    );

    List<ProductResponse> filterProducts(
            Long categoryId,
            Long subCategoryId,
            String keyword
    );

    ProductResponse updateProduct(
            Long id,
            ProductUpdateRequest request
    );

    void deleteProduct(
            Long id
    );
}