package com.nextcart.nextcart.seller_module.payment_module.exceptions;

public class SellerEarningCreationException extends RuntimeException {

    public SellerEarningCreationException(String message) {
        super(message);
    }

    public SellerEarningCreationException(
            String message,
            Throwable cause) {
        super(message, cause);
    }
}