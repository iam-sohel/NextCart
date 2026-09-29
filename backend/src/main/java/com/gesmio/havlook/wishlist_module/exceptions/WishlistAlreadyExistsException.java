package com.gesmio.havlook.wishlist_module.exceptions;

public class WishlistAlreadyExistsException extends RuntimeException {

    public WishlistAlreadyExistsException(String message) {
        super(message);
    }
}