package com.nextcart.nextcart.product_module.productSpecification.exceptions;

public class ProductSpecificationAlreadyExistsException
        extends RuntimeException {

    public ProductSpecificationAlreadyExistsException(String message) {
        super(message);
    }
}