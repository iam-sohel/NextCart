package com.nextcart.nextcart.product_module.productSpecification;

import com.nextcart.nextcart.product_module.productSpecification.productSpecification.ProductSpecificationCreateRequest;
import com.nextcart.nextcart.product_module.productSpecification.productSpecification.ProductSpecificationResponse;
import com.nextcart.nextcart.product_module.productSpecification.productSpecification.ProductSpecificationUpdateRequest;
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