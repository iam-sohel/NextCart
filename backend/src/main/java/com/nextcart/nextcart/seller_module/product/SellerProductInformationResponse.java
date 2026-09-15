package com.nextcart.nextcart.seller_module.product;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerProductInformationResponse {

    private String shortDescription;

    private String longDescription;

    private String warranty;

    private String manufacturer;
}