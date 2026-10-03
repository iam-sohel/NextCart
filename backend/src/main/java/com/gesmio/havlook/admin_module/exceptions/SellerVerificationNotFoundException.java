package com.gesmio.havlook.admin_module.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class SellerVerificationNotFoundException
        extends RuntimeException {

    public SellerVerificationNotFoundException(Long sellerId) {
        super("Seller verification record not found for seller: " + sellerId);
    }
}