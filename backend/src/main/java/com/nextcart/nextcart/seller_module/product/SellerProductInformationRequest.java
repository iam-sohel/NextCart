package com.nextcart.nextcart.seller_module.product;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerProductInformationRequest {

    @Size(
            max = 500,
            message = "Short description must not exceed 500 characters"
    )
    private String shortDescription;

    private String longDescription;

    @Size(
            max = 200,
            message = "Warranty must not exceed 200 characters"
    )
    private String warranty;

    @Size(
            max = 200,
            message = "Manufacturer must not exceed 200 characters"
    )
    private String manufacturer;
}