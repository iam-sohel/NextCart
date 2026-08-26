package com.nextcart.nextcart.checkout_module;

import jakarta.validation.constraints.NotNull;
import lombok.*;



@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequestDTO {

    @NotNull(message = "Shipping address is required")
    private Long shippingAddressId;

    private Long billingAddressId;

    @Builder.Default
    private Boolean sameAsShipping = true;

    private String couponCode;

    private String notes;
}