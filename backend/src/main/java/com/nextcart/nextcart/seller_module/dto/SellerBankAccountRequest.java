package com.nextcart.nextcart.seller_module.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerBankAccountRequest {

    @NotBlank(message = "Account holder name is required")
    @Size(
            max = 150,
            message = "Account holder name must not exceed 150 characters"
    )
    private String accountHolderName;

    @NotBlank(message = "Account number is required")
    @Pattern(
            regexp = "^[0-9]{9,30}$",
            message = "Invalid bank account number"
    )
    private String accountNumber;

    @NotBlank(message = "IFSC code is required")
    @Pattern(
            regexp = "^[A-Z]{4}0[A-Z0-9]{6}$",
            message = "Invalid IFSC code"
    )
    private String ifscCode;

    @NotBlank(message = "Bank name is required")
    @Size(
            max = 150,
            message = "Bank name must not exceed 150 characters"
    )
    private String bankName;
}