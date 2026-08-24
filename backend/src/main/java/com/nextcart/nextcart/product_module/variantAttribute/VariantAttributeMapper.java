package com.nextcart.nextcart.product_module.variantAttribute;

import com.nextcart.nextcart.product_module.variantAttribute.dto.VariantAttributeCreateRequest;
import com.nextcart.nextcart.product_module.variantAttribute.dto.VariantAttributeResponse;
import com.nextcart.nextcart.product_module.variantAttribute.dto.VariantAttributeUpdateRequest;
import org.springframework.stereotype.Component;

@Component
public class VariantAttributeMapper {

    public VariantAttributeEntity toEntity(
            VariantAttributeCreateRequest request) {

        return VariantAttributeEntity.builder()
                .attributeName(request.getAttributeName().trim())
                .attributeValue(request.getAttributeValue().trim())
                .build();
    }

    public VariantAttributeResponse toResponse(
            VariantAttributeEntity attribute) {

        return VariantAttributeResponse.builder()
                .id(attribute.getId())
                .variantId(attribute.getVariant().getId())
                .attributeName(attribute.getAttributeName())
                .attributeValue(attribute.getAttributeValue())
                .build();
    }

    public void updateEntity(
            VariantAttributeUpdateRequest request,
            VariantAttributeEntity attribute) {

        attribute.setAttributeName(
                request.getAttributeName().trim()
        );

        attribute.setAttributeValue(
                request.getAttributeValue().trim()
        );
    }
}