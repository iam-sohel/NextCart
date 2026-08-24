package com.nextcart.nextcart.product_module.productInformation.productInformation;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductInformationResponse {

    private Long id;

    private Long productId;

    private String shortDescription;

    private String longDescription;

    private String warranty;

    private String manufacturer;
}