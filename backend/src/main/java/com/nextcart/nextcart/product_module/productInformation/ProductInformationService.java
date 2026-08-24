package com.nextcart.nextcart.product_module.productInformation;

import com.nextcart.nextcart.product_module.productInformation.productInformation.ProductInformationCreateRequest;
import com.nextcart.nextcart.product_module.productInformation.productInformation.ProductInformationResponse;
import com.nextcart.nextcart.product_module.productInformation.productInformation.ProductInformationUpdateRequest;

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