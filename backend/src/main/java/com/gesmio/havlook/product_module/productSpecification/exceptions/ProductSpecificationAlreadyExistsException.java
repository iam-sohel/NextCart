package com.gesmio.havlook.product_module.productSpecification.exceptions;

public class ProductSpecificationAlreadyExistsException
        extends RuntimeException {

    public ProductSpecificationAlreadyExistsException(String message) {
        super(message);
    }
}