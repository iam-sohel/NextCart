package com.nextcart.nextcart.customer_module.exceptions;

public class CustomerValidationException extends RuntimeException {

    public CustomerValidationException(String message) {
        super(message);
    }
}