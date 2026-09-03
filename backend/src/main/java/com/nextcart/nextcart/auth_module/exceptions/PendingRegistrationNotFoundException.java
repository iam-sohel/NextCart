package com.nextcart.nextcart.auth_module.exceptions;

public class PendingRegistrationNotFoundException
        extends RuntimeException {

    public PendingRegistrationNotFoundException(String message) {
        super(message);
    }
}