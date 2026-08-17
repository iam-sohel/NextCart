package com.nextcart.nextcart.brand_module.exceptions;

public class BrandAlreadyExistsException extends RuntimeException {

    public BrandAlreadyExistsException(String message) {
        super(message);
    }
}