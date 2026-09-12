package com.nextcart.nextcart.seller_module.seller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerUpdateRequest {

    @NotBlank(message = "Business name is required")
    @Size(
            max = 150,
            message = "Business name must not exceed 150 characters"
    )
    private String businessName;
}