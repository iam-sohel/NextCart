package com.nextcart.nextcart.product_module.productSpecification.mapper;

import com.nextcart.nextcart.product_module.productSpecification.dto.ProductSpecificationCreateRequest;
import com.nextcart.nextcart.product_module.productSpecification.dto.ProductSpecificationResponse;
import com.nextcart.nextcart.product_module.productSpecification.dto.ProductSpecificationUpdateRequest;
import com.nextcart.nextcart.product_module.productSpecification.entity.ProductSpecification;
import org.springframework.stereotype.Component;

@Component
public class ProductSpecificationMapper {

    public ProductSpecification toEntity(
            ProductSpecificationCreateRequest request) {

        return ProductSpecification.builder()
                .specificationName(
                        request.getSpecificationName().trim()
                )
                .specificationValue(
                        request.getSpecificationValue().trim()
                )
                .build();
    }

    public ProductSpecificationResponse toResponse(
            ProductSpecification specification) {

        return ProductSpecificationResponse.builder()
                .id(specification.getId())
                .productId(specification.getProductEntity().getId())
                .specificationName(
                        specification.getSpecificationName()
                )
                .specificationValue(
                        specification.getSpecificationValue()
                )
                .build();
    }

    public void updateEntity(
            ProductSpecificationUpdateRequest request,
            ProductSpecification specification) {

        specification.setSpecificationName(
                request.getSpecificationName().trim()
        );

        specification.setSpecificationValue(
                request.getSpecificationValue().trim()
        );
    }
}