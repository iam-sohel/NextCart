package com.nextcart.nextcart.seller_module.product;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerProductSpecificationResponse {

    private Long id;

    private String specificationName;

    private String specificationValue;
}