package com.nextcart.nextcart.product_module.productVariant;

import com.nextcart.nextcart.product_module.productVariant.dto.ProductVariantCreateRequest;
import com.nextcart.nextcart.product_module.productVariant.dto.ProductVariantResponse;
import com.nextcart.nextcart.product_module.productVariant.dto.ProductVariantUpdateRequest;
import org.springframework.stereotype.Component;

@Component
public class ProductVariantMapper {

    public ProductVariantEntity toEntity(
            ProductVariantCreateRequest request) {

        return ProductVariantEntity.builder()
                .sku(request.getSku().trim())
                .build();
    }

    public ProductVariantResponse toResponse(
            ProductVariantEntity variant) {

        return ProductVariantResponse.builder()
                .id(variant.getId())
                .productId(variant.getId())
                .sku(variant.getSku())
                .status(variant.getStatus())
                .build();
    }

    public void updateEntity(
            ProductVariantUpdateRequest request,
            ProductVariantEntity variant) {

        variant.setSku(request.getSku().trim());
        variant.setStatus(request.getStatus());
    }
}