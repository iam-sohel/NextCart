package com.nextcart.nextcart.seller_module.sellerKyc.exception;

public class SellerKycDocumentUploadException extends RuntimeException {

    public SellerKycDocumentUploadException(String message) {
        super(message);
    }

    public SellerKycDocumentUploadException(
            String message,
            Throwable cause
    ) {
        super(message, cause);
    }
}