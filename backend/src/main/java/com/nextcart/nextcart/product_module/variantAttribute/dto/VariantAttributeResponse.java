package com.nextcart.nextcart.product_module.variantAttribute.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VariantAttributeResponse {

    private Long id;

    private Long variantId;

    private String attributeName;

    private String attributeValue;
}