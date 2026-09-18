package com.nextcart.nextcart.seller_module.sellerVerification;

public interface EmailValidationService {

    EmailVerificationResult verify(String email);

    record EmailVerificationResult(
            boolean passed,
            String status,
            Integer score,
            Boolean disposable,
            Boolean valid,
            String result,
            String message
    ) {
    }
}