package com.gesmio.havlook.product_module.productSpecification.service;

import com.gesmio.havlook.product_module.productSpecification.dto.ProductSpecificationCreateRequest;
import com.gesmio.havlook.product_module.productSpecification.dto.ProductSpecificationResponse;
import com.gesmio.havlook.product_module.productSpecification.dto.ProductSpecificationUpdateRequest;

import java.util.List;

public interface ProductSpecificationService {

    ProductSpecificationResponse createSpecification(Long productId, ProductSpecificationCreateRequest request);

    ProductSpecificationResponse getSpecificationById(Long id);

    List<ProductSpecificationResponse> getSpecificationsByProductId(Long productId);

    ProductSpecificationResponse updateSpecification(Long id, ProductSpecificationUpdateRequest request);

    void deleteSpecification(Long id);
}