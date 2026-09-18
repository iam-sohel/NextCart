package com.nextcart.nextcart.seller_module.sellerVerification;

public interface GstService {

    GstVerificationResult verify(String gstin);

    record GstVerificationResult(
            boolean passed,
            String status,
            String gstin,
            String legalName,
            String tradeName,
            String constitution,
            String taxPayerType,
            String registrationDate,
            String primaryAddress,
            String message
    ) {
    }
}