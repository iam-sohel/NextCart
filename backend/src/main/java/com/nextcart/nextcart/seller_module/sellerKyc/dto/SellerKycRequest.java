package com.nextcart.nextcart.seller_module.sellerKyc.dto;

import com.nextcart.nextcart.seller_module.sellerKyc.entity.BusinessType;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerKycRequest {

    @NotNull(message = "Business type is required")
    private BusinessType businessType;

    @Size(max = 15, message = "GST number must not exceed 15 characters")
    @Pattern(
            regexp = "^[0-9A-Z]{15}$",
            message = "Invalid GST number"
    )
    private String gstNumber;

    @Size(max = 100, message = "Registration number must not exceed 100 characters")
    private String registrationNumber;

    @NotBlank(message = "Owner name is required")
    @Size(max = 150, message = "Owner name must not exceed 150 characters")
    private String ownerName;

    @NotBlank(message = "PAN number is required")
    @Pattern(
            regexp = "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
            message = "Invalid PAN number"
    )
    private String panNumber;

    @Size(max = 12, message = "Aadhaar number must be 12 digits")
    @Pattern(
            regexp = "^\\d{12}$",
            message = "Invalid Aadhaar number"
    )
    private String aadhaarNumber;

    @NotBlank(message = "Business address is required")
    @Size(max = 500, message = "Business address must not exceed 500 characters")
    private String businessAddress;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @NotBlank(message = "State is required")
    @Size(max = 100, message = "State must not exceed 100 characters")
    private String state;

    @NotBlank(message = "Postal code is required")
    @Size(max = 10, message = "Postal code must not exceed 10 characters")
    private String postalCode;

    @NotBlank(message = "Country is required")
    @Size(max = 100, message = "Country must not exceed 100 characters")
    @Builder.Default
    private String country = "India";
}