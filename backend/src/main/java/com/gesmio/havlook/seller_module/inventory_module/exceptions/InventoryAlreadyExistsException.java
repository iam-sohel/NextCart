package com.gesmio.havlook.seller_module.inventory_module.exceptions;

public class InventoryAlreadyExistsException extends RuntimeException {

    public InventoryAlreadyExistsException(String message) {
        super(message);
    }
}