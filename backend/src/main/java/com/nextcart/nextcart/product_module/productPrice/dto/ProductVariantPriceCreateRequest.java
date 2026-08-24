package com.nextcart.nextcart.product_module.productPrice.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductVariantPriceCreateRequest {

    @NotNull(message = "MRP is required")
    @DecimalMin(
            value = "0.01",
            message = "MRP must be greater than 0"
    )
    private BigDecimal mrp;

    @NotNull(message = "Selling price is required")
    @DecimalMin(
            value = "0.01",
            message = "Selling price must be greater than 0"
    )
    private BigDecimal sellingPrice;

    @NotBlank(message = "Currency is required")
    @Size(
            min = 3,
            max = 3,
            message = "Currency must be a 3-letter code"
    )
    private String currency;
}