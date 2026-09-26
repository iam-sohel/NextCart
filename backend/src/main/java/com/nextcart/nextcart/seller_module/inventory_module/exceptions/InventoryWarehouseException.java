package com.nextcart.nextcart.seller_module.inventory_module.exceptions;

public class InventoryWarehouseException extends RuntimeException {

    public InventoryWarehouseException(String message) {
        super(message);
    }

    public InventoryWarehouseException(String message, Throwable cause) {
        super(message, cause);
    }
}