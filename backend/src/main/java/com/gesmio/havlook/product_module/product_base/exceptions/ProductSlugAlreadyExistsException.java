package com.gesmio.havlook.product_module.product_base.exceptions;

public class ProductSlugAlreadyExistsException extends RuntimeException {

    public ProductSlugAlreadyExistsException(String message) {
        super(message);
    }
}