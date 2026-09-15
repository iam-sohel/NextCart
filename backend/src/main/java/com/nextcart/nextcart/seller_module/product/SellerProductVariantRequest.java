package com.nextcart.nextcart.seller_module.product;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerProductVariantRequest {

    @NotBlank(message = "SKU is required")
    @Size(
            max = 100,
            message = "SKU must not exceed 100 characters"
    )
    private String sku;

    @Valid
    @NotEmpty(message = "At least one variant attribute is required")
    private List<SellerProductVariantAttributeRequest> attributes;

    @Valid
    private SellerProductVariantPriceRequest price;

    @Valid
    private List<SellerProductInventoryRequest> inventories;
}