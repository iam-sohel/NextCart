package com.nextcart.nextcart.product_module.exceptions;

public class ProductImageNotFoundException
        extends RuntimeException {

    public ProductImageNotFoundException(String message) {
        super(message);
    }
}