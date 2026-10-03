package com.gesmio.havlook.subcategory_module.exceptions;

public class SubCategoryAlreadyExistsException
        extends RuntimeException {

    public SubCategoryAlreadyExistsException(String message) {
        super(message);
    }
}