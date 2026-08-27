package com.nextcart.nextcart.product_module.product_base;

import com.nextcart.nextcart.product_module.product_base.dto.ProductCreateRequest;
import com.nextcart.nextcart.product_module.product_base.dto.ProductDetailsResponse;
import com.nextcart.nextcart.product_module.product_base.dto.ProductResponse;
import com.nextcart.nextcart.product_module.product_base.dto.ProductUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {

    ProductResponse createProduct(ProductCreateRequest request);

    ProductResponse getProductById(Long id);

    ProductResponse getProductBySlug(String slug);

    ProductDetailsResponse getProductDetailsById(Long id);

    ProductDetailsResponse getProductDetailsBySlug(String slug);

    Page<ProductResponse> getAllProducts(Pageable pageable);

    Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable);

    Page<ProductResponse> getProductsBySubCategory(Long subCategoryId, Pageable pageable);

    Page<ProductResponse> getProductsByBrand(Long brandId, Pageable pageable);

    ProductResponse updateProduct(Long id, ProductUpdateRequest request);

    void deactivateProduct(Long id);

    ProductResponse restoreProduct(Long id);
}