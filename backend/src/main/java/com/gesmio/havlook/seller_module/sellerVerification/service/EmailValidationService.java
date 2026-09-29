package com.gesmio.havlook.seller_module.sellerVerification.service;

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