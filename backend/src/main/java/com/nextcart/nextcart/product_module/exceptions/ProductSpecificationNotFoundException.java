package com.nextcart.nextcart.product_module.exceptions;

public class ProductSpecificationNotFoundException
        extends RuntimeException {

    public ProductSpecificationNotFoundException(String message) {
        super(message);
    }
}