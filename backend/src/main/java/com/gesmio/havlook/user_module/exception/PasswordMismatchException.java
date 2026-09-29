package com.gesmio.havlook.user_module.exception;

public class PasswordMismatchException extends RuntimeException {

    public PasswordMismatchException(String message) {
        super(message);
    }
}