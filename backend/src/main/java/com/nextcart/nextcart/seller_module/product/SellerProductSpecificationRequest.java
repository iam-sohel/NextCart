package com.nextcart.nextcart.seller_module.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerProductSpecificationRequest {

    @NotBlank(message = "Specification name is required")
    @Size(
            max = 100,
            message = "Specification name must not exceed 100 characters"
    )
    private String specificationName;

    @NotBlank(message = "Specification value is required")
    @Size(
            max = 500,
            message = "Specification value must not exceed 500 characters"
    )
    private String specificationValue;
}