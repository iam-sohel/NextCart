package com.nextcart.nextcart.product_module.productSpecification;

import com.nextcart.nextcart.product_module.productSpecification.productSpecification.ProductSpecificationCreateRequest;
import com.nextcart.nextcart.product_module.productSpecification.productSpecification.ProductSpecificationResponse;
import com.nextcart.nextcart.product_module.productSpecification.productSpecification.ProductSpecificationUpdateRequest;

import java.util.List;

public interface ProductSpecificationService {

    ProductSpecificationResponse createSpecification(Long productId, ProductSpecificationCreateRequest request);

    ProductSpecificationResponse getSpecificationById(Long id);

    List<ProductSpecificationResponse> getSpecificationsByProductId(Long productId);

    ProductSpecificationResponse updateSpecification(Long id, ProductSpecificationUpdateRequest request);

    void deleteSpecification(Long id);
}