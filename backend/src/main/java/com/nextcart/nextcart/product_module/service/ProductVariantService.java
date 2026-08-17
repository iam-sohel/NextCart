package com.nextcart.nextcart.product_module.service;

import com.nextcart.nextcart.product_module.dto.ProductVariant.ProductVariantCreateRequest;
import com.nextcart.nextcart.product_module.dto.ProductVariant.ProductVariantResponse;
import com.nextcart.nextcart.product_module.dto.ProductVariant.ProductVariantUpdateRequest;

import java.util.List;

public interface ProductVariantService {

    ProductVariantResponse createVariant(
            ProductVariantCreateRequest request
    );

    ProductVariantResponse getVariantById(
            Long id
    );

    List<ProductVariantResponse> getAllVariants();

    List<ProductVariantResponse> getVariantsByProductId(
            Long productId
    );

    ProductVariantResponse updateVariant(
            Long id,
            ProductVariantUpdateRequest request
    );

    void deleteVariant(Long id);
}