package com.nextcart.nextcart.subcategory_module.exceptions;

public class SubCategoryAlreadyExistsException
        extends RuntimeException {

    public SubCategoryAlreadyExistsException(String message) {
        super(message);
    }
}