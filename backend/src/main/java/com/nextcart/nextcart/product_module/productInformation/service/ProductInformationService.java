package com.nextcart.nextcart.product_module.productInformation.service;

import com.nextcart.nextcart.product_module.productInformation.dto.ProductInformationCreateRequest;
import com.nextcart.nextcart.product_module.productInformation.dto.ProductInformationResponse;
import com.nextcart.nextcart.product_module.productInformation.dto.ProductInformationUpdateRequest;

public interface ProductInformationService {

    ProductInformationResponse createInformation(
            Long productId,
            ProductInformationCreateRequest request
    );

    ProductInformationResponse getInformationById(
            Long id
    );

    ProductInformationResponse getInformationByProductId(
            Long productId
    );

    ProductInformationResponse updateInformation(
            Long id,
            ProductInformationUpdateRequest request
    );

    void deleteInformation(
            Long id
    );
}