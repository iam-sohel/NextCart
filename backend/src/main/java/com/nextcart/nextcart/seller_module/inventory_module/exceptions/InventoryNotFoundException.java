package com.nextcart.nextcart.seller_module.inventory_module.exceptions;

public class InventoryNotFoundException extends RuntimeException {

    public InventoryNotFoundException(String message) {
        super(message);
    }

    public InventoryNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}