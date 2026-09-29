package com.gesmio.havlook.product_module.productSpecification.exceptions;

public class ProductSpecificationNotFoundException
        extends RuntimeException {

    public ProductSpecificationNotFoundException(String message) {
        super(message);
    }
}