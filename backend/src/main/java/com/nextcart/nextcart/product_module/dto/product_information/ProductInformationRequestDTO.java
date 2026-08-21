package com.nextcart.nextcart.product_module.dto.product_information;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ProductInformationRequestDTO {

    @NotNull(message = "Product ID is required")
    private Long productId;

    private String shortDescription;

    private String longDescription;

    private String warranty;

    private String manufacturer;
}