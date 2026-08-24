package com.nextcart.nextcart.product_module.exceptions;

public class ProductSpecificationAlreadyExistsException
        extends RuntimeException {

    public ProductSpecificationAlreadyExistsException(String message) {
        super(message);
    }
}