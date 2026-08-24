package com.nextcart.nextcart.product_module.inventory.exceptions;

public class InventoryAlreadyExistsException extends RuntimeException {

    public InventoryAlreadyExistsException(String message) {
        super(message);
    }
}