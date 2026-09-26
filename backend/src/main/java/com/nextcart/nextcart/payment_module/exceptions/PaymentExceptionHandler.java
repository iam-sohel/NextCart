package com.nextcart.nextcart.payment_module.exceptions;

import com.nextcart.nextcart.common.dto.CommonResponseDto;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(
        basePackages = "com.nextcart.nextcart.payment_module.controller"
)
public class PaymentExceptionHandler {

    // =========================================================
    // AUTHENTICATION
    // =========================================================

    @ExceptionHandler(PaymentAuthenticationException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handlePaymentAuthenticationException(
            PaymentAuthenticationException exception
    ) {

        return buildResponse(
                HttpStatus.UNAUTHORIZED,
                "PAYMENT_AUTHENTICATION_REQUIRED",
                exception.getMessage()
        );
    }

    // =========================================================
    // PAYMENT NOT FOUND
    // =========================================================

    @ExceptionHandler(PaymentNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handlePaymentNotFoundException(
            PaymentNotFoundException exception
    ) {

        return buildResponse(
                HttpStatus.NOT_FOUND,
                "PAYMENT_NOT_FOUND",
                exception.getMessage()
        );
    }

    // =========================================================
    // PAYMENT VALIDATION
    // =========================================================

    @ExceptionHandler(PaymentValidationException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handlePaymentValidationException(
            PaymentValidationException exception
    ) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "PAYMENT_VALIDATION_ERROR",
                exception.getMessage()
        );
    }

    // =========================================================
    // PAYMENT VERIFICATION
    // =========================================================

    @ExceptionHandler(PaymentVerificationException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handlePaymentVerificationException(
            PaymentVerificationException exception
    ) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "PAYMENT_VERIFICATION_FAILED",
                exception.getMessage()
        );
    }

    // =========================================================
    // PAYMENT GATEWAY
    // =========================================================

    @ExceptionHandler(PaymentGatewayException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handlePaymentGatewayException(
            PaymentGatewayException exception
    ) {

        return buildResponse(
                HttpStatus.BAD_GATEWAY,
                "PAYMENT_GATEWAY_ERROR",
                exception.getMessage()
        );
    }

    // =========================================================
    // @VALID VALIDATION
    // =========================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleMethodArgumentNotValidException(
            MethodArgumentNotValidException exception
    ) {

        String message = exception
                .getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Validation failed");

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                message
        );
    }

    // =========================================================
    // PARAMETER VALIDATION
    // =========================================================

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleConstraintViolationException(
            ConstraintViolationException exception
    ) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                exception.getMessage()
        );
    }

    // =========================================================
    // INVALID JSON BODY
    // =========================================================

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleHttpMessageNotReadableException(
            HttpMessageNotReadableException exception
    ) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "INVALID_REQUEST_BODY",
                "Invalid request body"
        );
    }

    // =========================================================
    // COMMON RESPONSE BUILDER
    // =========================================================

    private ResponseEntity<CommonResponseDto<Void>> buildResponse(
            HttpStatus status,
            String errorCode,
            String message
    ) {

        CommonResponseDto<Void> response =
                new CommonResponseDto<>(
                        false,
                        message,
                        null,
                        errorCode
                );

        return ResponseEntity
                .status(status)
                .body(response);
    }
}