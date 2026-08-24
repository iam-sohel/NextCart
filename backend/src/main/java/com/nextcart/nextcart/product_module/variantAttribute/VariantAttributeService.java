package com.nextcart.nextcart.product_module.variantAttribute;

import com.nextcart.nextcart.product_module.variantAttribute.dto.VariantAttributeCreateRequest;
import com.nextcart.nextcart.product_module.variantAttribute.dto.VariantAttributeResponse;
import com.nextcart.nextcart.product_module.variantAttribute.dto.VariantAttributeUpdateRequest;

import java.util.List;

public interface VariantAttributeService {

    VariantAttributeResponse createAttribute(
            Long variantId,
            VariantAttributeCreateRequest request
    );

    VariantAttributeResponse getAttributeById(
            Long id
    );

    List<VariantAttributeResponse> getAttributesByVariant(
            Long variantId
    );

    VariantAttributeResponse updateAttribute(
            Long id,
            VariantAttributeUpdateRequest request
    );

    void deleteAttribute(Long id);
}