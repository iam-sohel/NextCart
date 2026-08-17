package com.nextcart.nextcart.product_module.mapper;

import com.nextcart.nextcart.product_module.dto.productSpecification.ProductSpecificationCreateRequest;
import com.nextcart.nextcart.product_module.dto.productSpecification.ProductSpecificationResponse;
import com.nextcart.nextcart.product_module.dto.productSpecification.ProductSpecificationUpdateRequest;
import com.nextcart.nextcart.product_module.entity.Product;
import com.nextcart.nextcart.product_module.entity.ProductSpecification;
import org.springframework.stereotype.Component;

@Component
public class ProductSpecificationMapper {

    public ProductSpecification toEntity(
            ProductSpecificationCreateRequest request,
            Product product) {

        ProductSpecification specification =
                new ProductSpecification();

        specification.setProduct(product);
        specification.setSpecificationName(
                request.getSpecificationName()
        );
        specification.setSpecificationValue(
                request.getSpecificationValue()
        );

        return specification;
    }

    public ProductSpecificationResponse toResponse(
            ProductSpecification specification) {

        ProductSpecificationResponse response =
                new ProductSpecificationResponse();

        response.setId(specification.getId());

        response.setProductId(
                specification.getProduct().getId()
        );

        response.setSpecificationName(
                specification.getSpecificationName()
        );

        response.setSpecificationValue(
                specification.getSpecificationValue()
        );

        return response;
    }

    public void updateEntity(
            ProductSpecificationUpdateRequest request,
            ProductSpecification specification) {

        specification.setSpecificationName(
                request.getSpecificationName()
        );

        specification.setSpecificationValue(
                request.getSpecificationValue()
        );
    }
}