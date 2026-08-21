package com.nextcart.nextcart.product_module.dto.product_information;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductInformationResponseDTO {

    private Long id;

    private Long productId;

    private String shortDescription;

    private String longDescription;

    private String warranty;

    private String manufacturer;
}