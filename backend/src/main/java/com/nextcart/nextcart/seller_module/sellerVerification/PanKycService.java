package com.nextcart.nextcart.seller_module.sellerVerification;

import java.time.LocalDate;

public interface PanKycService {

    PanVerificationResult verify(
            String panNumber,
            String name,
            LocalDate dateOfBirth
    );

    record PanVerificationResult(
            boolean passed,
            String status,
            Boolean nameMatch,
            Boolean dateOfBirthMatch,
            String transactionId,
            String message
    ) {
    }
}