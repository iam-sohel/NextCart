package com.nextcart.nextcart.product_module.discount;

import com.nextcart.nextcart.product_module.discount.dto.ProductVariantDiscountCreateRequest;
import com.nextcart.nextcart.product_module.discount.dto.ProductVariantDiscountResponse;
import com.nextcart.nextcart.product_module.discount.dto.ProductVariantDiscountUpdateRequest;

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