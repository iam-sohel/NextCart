package com.nextcart.nextcart.product_module.exception;

public class ProductAlreadyExistsException extends RuntimeException {
    public ProductAlreadyExistsException(String message) { super(message); }
}
