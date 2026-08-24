package com.nextcart.nextcart.product_module.productSpecification.productSpecification;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductSpecificationCreateRequest {

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