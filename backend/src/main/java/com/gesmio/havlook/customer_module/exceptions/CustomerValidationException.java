package com.gesmio.havlook.customer_module.exceptions;

public class CustomerValidationException extends RuntimeException {

    public CustomerValidationException(String message) {
        super(message);
    }
}