package com.nextcart.nextcart.seller_module.payment_module.exceptions;

public class SellerDashboardValidationException
        extends RuntimeException {

    public SellerDashboardValidationException(String message) {
        super(message);
    }

    public SellerDashboardValidationException(
            String message,
            Throwable cause) {
        super(message, cause);
    }
}