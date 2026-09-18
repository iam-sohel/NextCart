package com.nextcart.nextcart.admin_module;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerVerificationRejectRequest {

    @NotBlank(message = "Rejection reason is required")
    @Size(
            max = 1000,
            message = "Rejection reason must not exceed 1000 characters"
    )
    private String reason;
}