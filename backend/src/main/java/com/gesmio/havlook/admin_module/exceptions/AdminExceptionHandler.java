package com.gesmio.havlook.admin_module.exceptions;

import com.gesmio.havlook.common.dto.CommonResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(
        basePackages = "com.gesmio.havlook.admin_module"
)
public class AdminExceptionHandler {

    // =========================================================
    // ADMIN CUSTOMER - NOT FOUND
    // =========================================================

    @ExceptionHandler(AdminCustomerNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleAdminCustomerNotFound(
            AdminCustomerNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "ADMIN_CUSTOMER_NOT_FOUND"
                        )
                );
    }

    // =========================================================
    // ADMIN CUSTOMER - STATE
    // =========================================================

    @ExceptionHandler(AdminCustomerStateException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleAdminCustomerState(
            AdminCustomerStateException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "ADMIN_CUSTOMER_STATE_ERROR"
                        )
                );
    }

    // =========================================================
    // ADMIN CUSTOMER - VALIDATION
    // =========================================================

    @ExceptionHandler(AdminCustomerValidationException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleAdminCustomerValidation(
            AdminCustomerValidationException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "ADMIN_CUSTOMER_VALIDATION_ERROR"
                        )
                );
    }


    // =========================================================
    // ADMIN SELLER KYC - NOT FOUND
    // =========================================================

    @ExceptionHandler(AdminSellerKycNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleAdminSellerKycNotFound(
            AdminSellerKycNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "ADMIN_SELLER_KYC_NOT_FOUND"
                        )
                );
    }

    // =========================================================
    // ADMIN SELLER KYC - STATE
    // =========================================================

    @ExceptionHandler(AdminSellerKycStateException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleAdminSellerKycState(
            AdminSellerKycStateException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "ADMIN_SELLER_KYC_STATE_ERROR"
                        )
                );
    }

    // =========================================================
    // ADMIN SELLER KYC - VALIDATION
    // =========================================================

    @ExceptionHandler(AdminSellerKycValidationException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleAdminSellerKycValidation(
            AdminSellerKycValidationException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "ADMIN_SELLER_KYC_VALIDATION_ERROR"
                        )
                );
    }


    // =========================================================
    // ADMIN SELLER - NOT FOUND
    // =========================================================

    @ExceptionHandler(AdminSellerNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleAdminSellerNotFound(
            AdminSellerNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "ADMIN_SELLER_NOT_FOUND"
                        )
                );
    }

    // =========================================================
    // ADMIN SELLER - STATE
    // =========================================================

    @ExceptionHandler(AdminSellerStateException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleAdminSellerState(
            AdminSellerStateException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "ADMIN_SELLER_STATE_ERROR"
                        )
                );
    }

    // =========================================================
    // ADMIN SELLER - VALIDATION
    // =========================================================

    @ExceptionHandler(AdminSellerValidationException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleAdminSellerValidation(
            AdminSellerValidationException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "ADMIN_SELLER_VALIDATION_ERROR"
                        )
                );
    }


    // =========================================================
    // SELLER VERIFICATION - NOT FOUND
    // =========================================================

    @ExceptionHandler(SellerVerificationNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleSellerVerificationNotFound(
            SellerVerificationNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "SELLER_VERIFICATION_NOT_FOUND"
                        )
                );
    }


    // =========================================================
    // ILLEGAL ARGUMENT
    // =========================================================

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleIllegalArgumentException(
            IllegalArgumentException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "BAD_REQUEST"
                        )
                );
    }


    // =========================================================
    // ILLEGAL STATE
    // =========================================================

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleIllegalStateException(
            IllegalStateException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "INVALID_STATE"
                        )
                );
    }
}