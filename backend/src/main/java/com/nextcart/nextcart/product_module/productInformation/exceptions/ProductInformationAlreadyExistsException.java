package com.nextcart.nextcart.product_module.productInformation.exceptions;

public class ProductInformationAlreadyExistsException extends RuntimeException {

    public ProductInformationAlreadyExistsException(String message) {
        super(message);
    }
}