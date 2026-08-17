package com.nextcart.nextcart.product_module.service;



import com.nextcart.nextcart.product_module.dto.varaintAtrribute.VariantAttributeCreateRequest;
import com.nextcart.nextcart.product_module.dto.varaintAtrribute.VariantAttributeResponse;
import com.nextcart.nextcart.product_module.dto.varaintAtrribute.VariantAttributeUpdateRequest;

import java.util.List;

public interface VariantAttributeService {

    VariantAttributeResponse createAttribute(
            VariantAttributeCreateRequest request
    );

    VariantAttributeResponse getAttributeById(
            Long id
    );

    List<VariantAttributeResponse> getAllAttributes();

    List<VariantAttributeResponse> getAttributesByVariantId(
            Long variantId
    );

    VariantAttributeResponse updateAttribute(
            Long id,
            VariantAttributeUpdateRequest request
    );

    void deleteAttribute(Long id);
}