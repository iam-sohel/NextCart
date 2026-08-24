package com.nextcart.nextcart.product_module.productImage;

import com.nextcart.nextcart.product_module.productImage.productImageDTO.ProductImageCreateRequest;
import com.nextcart.nextcart.product_module.productImage.productImageDTO.ProductImageResponse;
import com.nextcart.nextcart.product_module.productImage.productImageDTO.ProductImageUpdateRequest;
import org.springframework.stereotype.Component;

@Component
public class ProductImageMapper {

    public ProductImageEntity toEntity(
            ProductImageCreateRequest request) {

        return ProductImageEntity.builder()
                .imageUrl(request.getImageUrl())
                .isPrimary(request.getIsPrimary())
                .displayOrder(request.getDisplayOrder())
                .build();
    }

    public ProductImageResponse toResponse(
            ProductImageEntity productImage) {

        return ProductImageResponse.builder()
                .id(productImage.getId())
                .productId(productImage.getId())
                .imageUrl(productImage.getImageUrl())
                .isPrimary(productImage.getIsPrimary())
                .displayOrder(productImage.getDisplayOrder())
                .build();
    }

    public void updateEntity(
            ProductImageUpdateRequest request,
            ProductImageEntity productImage) {

        productImage.setImageUrl(request.getImageUrl());
        productImage.setIsPrimary(request.getIsPrimary());
        productImage.setDisplayOrder(request.getDisplayOrder());
    }
}