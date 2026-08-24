package com.nextcart.nextcart.product_module.productImage.productImageDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductImageCreateRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotBlank(message = "Image URL is required")
    private String imageUrl;

    @NotNull(message = "Primary status is required")
    private Boolean isPrimary;

    @PositiveOrZero(message = "Display order cannot be negative")
    private Integer displayOrder;
}