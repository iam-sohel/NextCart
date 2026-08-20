package com.nextcart.nextcart.product_module.dto.productSpecification;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductSpecificationCreateRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotBlank(message = "Specification name is required")
    private String specificationName;

    @NotBlank(message = "Specification value is required")
    private String specificationValue;
}