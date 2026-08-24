package com.nextcart.nextcart.product_module.productVariant;

import com.nextcart.nextcart.product_module.productVariant.dto.ProductVariantCreateRequest;
import com.nextcart.nextcart.product_module.productVariant.dto.ProductVariantResponse;
import com.nextcart.nextcart.product_module.productVariant.dto.ProductVariantUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductVariantService {

    ProductVariantResponse createVariant(
            ProductVariantCreateRequest request
    );

    ProductVariantResponse getVariantById(
            Long id
    );

    ProductVariantResponse getVariantBySku(
            String sku
    );

    Page<ProductVariantResponse> getVariantsByProduct(
            Long productId,
            Pageable pageable
    );

    Page<ProductVariantResponse> getActiveVariantsByProduct(
            Long productId,
            Pageable pageable
    );

    ProductVariantResponse updateVariant(
            Long id,
            ProductVariantUpdateRequest request
    );

    void deactivateVariant(Long id);

    ProductVariantResponse restoreVariant(Long id);
}