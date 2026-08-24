package com.nextcart.nextcart.product_module.variantAttribute.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VariantAttributeUpdateRequest {

    @NotBlank(message = "Attribute name is required")
    @Size(max = 100, message = "Attribute name must not exceed 100 characters")
    private String attributeName;

    @NotBlank(message = "Attribute value is required")
    @Size(max = 255, message = "Attribute value must not exceed 255 characters")
    private String attributeValue;
}