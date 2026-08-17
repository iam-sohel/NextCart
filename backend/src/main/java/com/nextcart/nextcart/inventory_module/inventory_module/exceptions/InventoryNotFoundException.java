package com.nextcart.nextcart.inventory_module.exceptions;

public class InventoryNotFoundException extends RuntimeException {

    public InventoryNotFoundException(String message) {
        super(message);
    }
}