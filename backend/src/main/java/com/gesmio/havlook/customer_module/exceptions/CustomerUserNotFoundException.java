package com.gesmio.havlook.customer_module.exceptions;

public class CustomerUserNotFoundException extends RuntimeException {

    public CustomerUserNotFoundException(String message) {
        super(message);
    }
}