package com.gesmio.havlook.seller_module.sellerKyc.exception;

import com.gesmio.havlook.common.dto.CommonResponseDto;

import jakarta.validation.ConstraintViolationException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice(
        basePackages =
                "com.gesmio.havlook.seller_module.sellerKyc.controller"
)
public class SellerKycExceptionHandler {

    // =========================================================
    // KYC NOT FOUND
    // =========================================================

    @ExceptionHandler(SellerKycNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleKycNotFound(
            SellerKycNotFoundException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "SELLER_KYC_NOT_FOUND"
                        )
                );
    }

    // =========================================================
    // KYC VALIDATION
    // =========================================================

    @ExceptionHandler(SellerKycValidationException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleKycValidation(
            SellerKycValidationException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "SELLER_KYC_VALIDATION_ERROR"
                        )
                );
    }

    // =========================================================
    // KYC STATE
    // =========================================================

    @ExceptionHandler(SellerKycStateException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleKycState(
            SellerKycStateException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "SELLER_KYC_STATE_ERROR"
                        )
                );
    }

    // =========================================================
    // KYC DOCUMENT UPLOAD
    // =========================================================

    @ExceptionHandler(SellerKycDocumentUploadException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleDocumentUpload(
            SellerKycDocumentUploadException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "SELLER_KYC_DOCUMENT_UPLOAD_ERROR"
                        )
                );
    }

    // =========================================================
    // REQUEST VALIDATION
    // =========================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex
    ) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error ->
                        error.getField()
                                + ": "
                                + error.getDefaultMessage()
                )
                .collect(Collectors.joining(", "));

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                message,
                                null,
                                "VALIDATION_ERROR"
                        )
                );
    }

    // =========================================================
    // CONSTRAINT VALIDATION
    // =========================================================

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleConstraintViolation(
            ConstraintViolationException ex
    ) {

        String message = ex.getConstraintViolations()
                .stream()
                .map(violation ->
                        violation.getPropertyPath()
                                + ": "
                                + violation.getMessage()
                )
                .collect(Collectors.joining(", "));

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                message,
                                null,
                                "VALIDATION_ERROR"
                        )
                );
    }

    // =========================================================
    // INVALID REQUEST BODY
    // =========================================================

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleInvalidRequestBody(
            HttpMessageNotReadableException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                "Invalid request body",
                                null,
                                "INVALID_REQUEST_BODY"
                        )
                );
    }
}