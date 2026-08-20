package com.nextcart.nextcart.product_module.dto.productImage;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductImageUpdateRequest {

    @NotBlank(message = "Image URL is required")
    private String imageUrl;

    @NotNull(message = "Primary image status is required")
    private Boolean isPrimary;

    private Integer displayOrder;
}