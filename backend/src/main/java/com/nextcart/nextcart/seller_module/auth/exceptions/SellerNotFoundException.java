package com.nextcart.nextcart.seller_module.auth.exceptions;

public class SellerNotFoundException extends RuntimeException {

    public SellerNotFoundException(String message) {
        super(message);
    }
}