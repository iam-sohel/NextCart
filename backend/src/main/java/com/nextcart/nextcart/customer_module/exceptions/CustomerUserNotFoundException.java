package com.nextcart.nextcart.customer_module.exceptions;

public class CustomerUserNotFoundException extends RuntimeException {

    public CustomerUserNotFoundException(String message) {
        super(message);
    }
}