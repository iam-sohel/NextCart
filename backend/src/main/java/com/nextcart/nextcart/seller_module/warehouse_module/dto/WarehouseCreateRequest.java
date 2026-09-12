package com.nextcart.nextcart.seller_module.warehouse_module.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseCreateRequest {

    @NotBlank(message = "Warehouse name is required")
    @Size(max = 150, message = "Warehouse name must not exceed 150 characters")
    private String warehouseName;

    @NotBlank(message = "Contact person is required")
    @Size(max = 150, message = "Contact person must not exceed 150 characters")
    private String contactPerson;

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^[6-9][0-9]{9}$",
            message = "Invalid Indian phone number"
    )
    private String phoneNumber;

    @NotBlank(message = "Street address is required")
    @Size(max = 255, message = "Street address must not exceed 255 characters")
    private String streetAddress;

    @Size(max = 255, message = "Landmark must not exceed 255 characters")
    private String landmark;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @NotBlank(message = "State is required")
    @Size(max = 100, message = "State must not exceed 100 characters")
    private String state;

    @NotBlank(message = "Postal code is required")
    @Pattern(
            regexp = "^[0-9]{6}$",
            message = "Invalid Indian postal code"
    )
    private String postalCode;

    @NotBlank(message = "Country is required")
    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;
}