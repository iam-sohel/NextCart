package com.nextcart.nextcart.seller_module.sellerVerification;

public interface PhoneVerificationService {

    PhoneVerificationResult verify(
            String phoneNumber,
            String countryCode
    );

    record PhoneVerificationResult(
            boolean passed,
            String status,
            Boolean valid,
            String internationalFormat,
            String countryCode,
            String countryName,
            String location,
            String carrier,
            String lineType,
            String message
    ) {
    }
}