package com.nextcart.nextcart.auth_module.exceptions;

public class RegistrationExpiredException
        extends RuntimeException {

    public RegistrationExpiredException(String message) {
        super(message);
    }
}