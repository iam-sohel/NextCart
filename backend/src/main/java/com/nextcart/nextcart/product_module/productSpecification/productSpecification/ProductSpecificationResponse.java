package com.nextcart.nextcart.product_module.productSpecification.productSpecification;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSpecificationResponse {

    private Long id;

    private Long productId;

    private String specificationName;

    private String specificationValue;
}