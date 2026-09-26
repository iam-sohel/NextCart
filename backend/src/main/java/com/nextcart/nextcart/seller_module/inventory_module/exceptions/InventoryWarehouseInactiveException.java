package com.nextcart.nextcart.seller_module.inventory_module.exceptions;

public class InventoryWarehouseInactiveException extends RuntimeException {

    public InventoryWarehouseInactiveException(String message) {
        super(message);
    }

    public InventoryWarehouseInactiveException(String message, Throwable cause) {
        super(message, cause);
    }
}