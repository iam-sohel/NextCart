package com.gesmio.havlook.wishlist_module.exceptions;

public class WishlistProductNotFoundException extends RuntimeException {

    public WishlistProductNotFoundException(String message) {
        super(message);
    }
}