package com.gesmio.havlook.seller_module.product.dto;

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