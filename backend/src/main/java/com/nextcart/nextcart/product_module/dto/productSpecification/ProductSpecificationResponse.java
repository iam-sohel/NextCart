package com.nextcart.nextcart.product_module.dto.productSpecification;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSpecificationResponse {

    private Long id;

    private Long productId;

    private String specificationName;

    private String specificationValue;
}