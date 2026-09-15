package com.nextcart.nextcart.seller_module.product;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerProductCreateRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "SubCategory ID is required")
    private Long subCategoryId;

    @NotNull(message = "Brand ID is required")
    private Long brandId;

    @NotBlank(message = "Product name is required")
    @Size(
            max = 200,
            message = "Product name must not exceed 200 characters"
    )
    private String name;

    @NotBlank(message = "Product slug is required")
    @Size(
            max = 250,
            message = "Product slug must not exceed 250 characters"
    )
    private String slug;

    private String description;

    @Valid
    private SellerProductInformationRequest information;

    @Valid
    private List<SellerProductSpecificationRequest> specifications;

    @Valid
    private List<SellerProductVariantRequest> variants;
}