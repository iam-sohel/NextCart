package com.gesmio.havlook.seller_module.product.dto;

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