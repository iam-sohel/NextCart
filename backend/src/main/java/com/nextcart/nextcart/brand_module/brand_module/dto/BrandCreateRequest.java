package com.nextcart.nextcart.brand_module.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BrandCreateRequest {

    @NotBlank(message = "Brand name is required")
    private String name;
}