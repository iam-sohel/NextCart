package com.nextcart.nextcart.product_module.dto.varaintAtrribute;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VariantAttributeResponse {

    private Long id;

    private Long variantId;

    private String attributeName;

    private String attributeValue;
}