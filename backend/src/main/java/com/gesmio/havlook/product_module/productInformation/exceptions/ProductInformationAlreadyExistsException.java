package com.gesmio.havlook.product_module.productInformation.exceptions;

public class ProductInformationAlreadyExistsException extends RuntimeException {

    public ProductInformationAlreadyExistsException(String message) {
        super(message);
    }
}