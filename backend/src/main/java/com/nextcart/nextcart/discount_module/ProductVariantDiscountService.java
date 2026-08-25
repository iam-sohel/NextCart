package com.nextcart.nextcart.discount_module;

import com.nextcart.nextcart.discount_module.dto.ProductVariantDiscountCreateRequest;
import com.nextcart.nextcart.discount_module.dto.ProductVariantDiscountResponse;
import com.nextcart.nextcart.discount_module.dto.ProductVariantDiscountUpdateRequest;

import java.util.List;

public interface ProductVariantDiscountService {

    ProductVariantDiscountResponse createDiscount(ProductVariantDiscountCreateRequest request);

    ProductVariantDiscountResponse getDiscountById(Long id);

    List<ProductVariantDiscountResponse> getDiscountsByVariant(Long productVariantId);

    ProductVariantDiscountResponse updateDiscount(Long id, ProductVariantDiscountUpdateRequest request);

    void deactivateDiscount(Long id);

    ProductVariantDiscountResponse restoreDiscount(Long id);

    ProductVariantDiscountResponse getCurrentDiscount(Long productVariantId);
}