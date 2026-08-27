package com.nextcart.nextcart.product_module.productVariant.dto;

import com.nextcart.nextcart.product_module.productPrice.dto.ProductVariantPriceResponse;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantStatus;
import com.nextcart.nextcart.product_module.variantAttribute.dto.VariantAttributeResponse;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantResponse {

    private Long id;

    private Long productId;

    private String sku;

    private ProductVariantStatus status;

    private List<VariantAttributeResponse> attributes;

    private ProductVariantPriceResponse price;

    private String stockStatus;

    private Boolean available;
}