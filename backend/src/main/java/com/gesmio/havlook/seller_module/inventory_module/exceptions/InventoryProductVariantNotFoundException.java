package com.gesmio.havlook.seller_module.inventory_module.exceptions;

public class InventoryProductVariantNotFoundException extends RuntimeException {

    public InventoryProductVariantNotFoundException(String message) {
        super(message);
    }

    public InventoryProductVariantNotFoundException(
            String message,
            Throwable cause
    ) {
        super(message, cause);
    }
}