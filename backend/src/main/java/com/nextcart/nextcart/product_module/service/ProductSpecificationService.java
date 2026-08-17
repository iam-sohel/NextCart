package com.nextcart.nextcart.product_module.service;

import com.nextcart.nextcart.product_module.dto.productSpecification.ProductSpecificationCreateRequest;
import com.nextcart.nextcart.product_module.dto.productSpecification.ProductSpecificationResponse;
import com.nextcart.nextcart.product_module.dto.productSpecification.ProductSpecificationUpdateRequest;

import java.util.List;

public interface ProductSpecificationService {

    ProductSpecificationResponse createSpecification(
            ProductSpecificationCreateRequest request
    );

    ProductSpecificationResponse getSpecificationById(
            Long id
    );

    List<ProductSpecificationResponse> getAllSpecifications();

    List<ProductSpecificationResponse> getSpecificationsByProductId(
            Long productId
    );

    ProductSpecificationResponse updateSpecification(
            Long id,
            ProductSpecificationUpdateRequest request
    );

    void deleteSpecification(Long id);
}