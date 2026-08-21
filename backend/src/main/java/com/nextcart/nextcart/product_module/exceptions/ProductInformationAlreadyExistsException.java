package com.nextcart.nextcart.product_module.exceptions;

public class ProductInformationAlreadyExistsException extends RuntimeException {

    public ProductInformationAlreadyExistsException(String message) {
        super(message);
    }
}