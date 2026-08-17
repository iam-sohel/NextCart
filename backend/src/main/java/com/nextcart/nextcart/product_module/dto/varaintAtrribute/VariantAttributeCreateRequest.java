package com.nextcart.nextcart.product_module.dto.varaintAtrribute;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VariantAttributeCreateRequest {

    @NotNull(message = "Variant ID is required")
    private Long variantId;

    @NotBlank(message = "Attribute name is required")
    private String attributeName;

    @NotBlank(message = "Attribute value is required")
    private String attributeValue;
}