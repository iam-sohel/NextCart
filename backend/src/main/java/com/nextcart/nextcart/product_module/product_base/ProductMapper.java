package com.nextcart.nextcart.product_module.product_base;

import com.nextcart.nextcart.product_module.product_base.dto.ProductCreateRequest;
import com.nextcart.nextcart.product_module.product_base.dto.ProductResponse;
import com.nextcart.nextcart.product_module.product_base.dto.ProductUpdateRequest;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductEntity toEntity(
            ProductCreateRequest request) {

        ProductEntity productEntity = new ProductEntity();

        productEntity.setName(request.getName());
        productEntity.setSlug(request.getSlug());
        productEntity.setDescription(request.getDescription());

        return productEntity;
    }

    public ProductResponse toResponse(
            ProductEntity productEntity) {

        return ProductResponse.builder()
                .id(productEntity.getId())
                .categoryId(productEntity.getCategory().getId())
                .subCategoryId(productEntity.getSubCategory().getId())
                .brandId(productEntity.getBrand().getId())
                .name(productEntity.getName())
                .slug(productEntity.getSlug())
                .description(productEntity.getDescription())
                .status(productEntity.getStatus())
                .createdAt(productEntity.getCreatedAt())
                .updatedAt(productEntity.getUpdatedAt())
                .build();
    }

    public void updateEntity(
            ProductUpdateRequest request,
            ProductEntity productEntity) {

        productEntity.setName(request.getName());
        productEntity.setSlug(request.getSlug());
        productEntity.setDescription(request.getDescription());
    }
}