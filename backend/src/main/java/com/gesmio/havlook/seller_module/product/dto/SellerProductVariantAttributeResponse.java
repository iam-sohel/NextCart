package com.gesmio.havlook.seller_module.product.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerProductVariantAttributeResponse {

    private Long id;

    private String attributeName;

    private String attributeValue;
}