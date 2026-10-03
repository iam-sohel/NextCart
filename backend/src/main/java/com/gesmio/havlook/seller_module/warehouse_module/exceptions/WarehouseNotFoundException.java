package com.gesmio.havlook.seller_module.warehouse_module.exceptions;

public class WarehouseNotFoundException extends RuntimeException {

    public WarehouseNotFoundException(String message) {
        super(message);
    }
}