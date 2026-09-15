package com.nextcart.nextcart.seller_module.product;

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