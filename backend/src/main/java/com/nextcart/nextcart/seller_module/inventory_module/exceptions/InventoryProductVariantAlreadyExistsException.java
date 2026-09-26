package com.nextcart.nextcart.seller_module.inventory_module.exceptions;

public class InventoryProductVariantAlreadyExistsException
        extends RuntimeException {

    public InventoryProductVariantAlreadyExistsException(String message) {
        super(message);
    }

    public InventoryProductVariantAlreadyExistsException(
            String message,
            Throwable cause
    ) {
        super(message, cause);
    }
}