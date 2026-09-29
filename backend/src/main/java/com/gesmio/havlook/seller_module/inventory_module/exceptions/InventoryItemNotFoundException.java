package com.gesmio.havlook.seller_module.inventory_module.exceptions;

public class InventoryItemNotFoundException extends RuntimeException {

    public InventoryItemNotFoundException(String message) {
        super(message);
    }

    public InventoryItemNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}