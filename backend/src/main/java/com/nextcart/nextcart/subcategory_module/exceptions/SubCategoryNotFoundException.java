package com.nextcart.nextcart.subcategory_module.exceptions;

public class SubCategoryNotFoundException
        extends RuntimeException {

    public SubCategoryNotFoundException(String message) {
        super(message);
    }
}