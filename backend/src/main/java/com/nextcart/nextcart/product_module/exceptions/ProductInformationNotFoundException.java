package com.nextcart.nextcart.product_module.exceptions;

public class ProductInformationNotFoundException extends RuntimeException {

    public ProductInformationNotFoundException(String message) {
        super(message);
    }
}