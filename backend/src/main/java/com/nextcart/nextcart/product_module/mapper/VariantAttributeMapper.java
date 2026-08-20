package com.nextcart.nextcart.product_module.mapper;


import com.nextcart.nextcart.product_module.dto.varaintAtrribute.VariantAttributeCreateRequest;
import com.nextcart.nextcart.product_module.dto.varaintAtrribute.VariantAttributeResponse;
import com.nextcart.nextcart.product_module.dto.varaintAtrribute.VariantAttributeUpdateRequest;
import com.nextcart.nextcart.product_module.entity.ProductVariant;
import com.nextcart.nextcart.product_module.entity.VariantAttribute;
import org.springframework.stereotype.Component;

@Component
public class VariantAttributeMapper {

    public VariantAttribute toEntity(
            VariantAttributeCreateRequest request,
            ProductVariant variant) {

        VariantAttribute attribute = new VariantAttribute();

        attribute.setVariant(variant);
        attribute.setAttributeName(
                request.getAttributeName()
        );
        attribute.setAttributeValue(
                request.getAttributeValue()
        );

        return attribute;
    }

    public VariantAttributeResponse toResponse(
            VariantAttribute attribute) {

        VariantAttributeResponse response =
                new VariantAttributeResponse();

        response.setId(attribute.getId());

        response.setVariantId(
                attribute.getVariant().getId()
        );

        response.setAttributeName(
                attribute.getAttributeName()
        );

        response.setAttributeValue(
                attribute.getAttributeValue()
        );

        return response;
    }

    public void updateEntity(
            VariantAttributeUpdateRequest request,
            VariantAttribute attribute) {

        attribute.setAttributeName(
                request.getAttributeName()
        );

        attribute.setAttributeValue(
                request.getAttributeValue()
        );
    }
}