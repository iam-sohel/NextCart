package com.nextcart.nextcart.seller_module.inventory_module.exceptions;

public class InventoryStockException extends RuntimeException {

    public InventoryStockException(String message) {
        super(message);
    }

    public InventoryStockException(String message, Throwable cause) {
        super(message, cause);
    }
}