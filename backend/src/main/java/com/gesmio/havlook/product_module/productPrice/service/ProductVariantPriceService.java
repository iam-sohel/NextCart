package com.gesmio.havlook.product_module.productPrice.service;


import com.gesmio.havlook.product_module.productPrice.dto.ProductVariantPriceCreateRequest;
import com.gesmio.havlook.product_module.productPrice.dto.ProductVariantPriceResponse;
import com.gesmio.havlook.product_module.productPrice.dto.ProductVariantPriceUpdateRequest;

public interface ProductVariantPriceService {

    ProductVariantPriceResponse createPrice(
            Long productVariantId,
            ProductVariantPriceCreateRequest request
    );

    ProductVariantPriceResponse getPriceById(
            Long id
    );

    ProductVariantPriceResponse getPriceByVariantId(
            Long productVariantId
    );

    ProductVariantPriceResponse updatePrice(
            Long id,
            ProductVariantPriceUpdateRequest request
    );

    void deletePrice(
            Long id
    );
}