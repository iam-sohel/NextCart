package com.gesmio.havlook.seller_module.seller_coupon.exceptions;

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
                "com.gesmio.havlook.seller_module.seller_coupon.controller"
)
public class SellerCouponExceptionHandler {

    // =========================================================
    // COUPON ALREADY EXISTS
    // =========================================================

    @ExceptionHandler(SellerCouponAlreadyExistsException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleCouponAlreadyExists(
            SellerCouponAlreadyExistsException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "SELLER_COUPON_ALREADY_EXISTS"
                        )
                );
    }

    // =========================================================
    // COUPON / SELLER NOT FOUND
    // =========================================================

    @ExceptionHandler(SellerCouponNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleCouponNotFound(
            SellerCouponNotFoundException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "SELLER_COUPON_NOT_FOUND"
                        )
                );
    }

    // =========================================================
    // COUPON STATE
    // =========================================================

    @ExceptionHandler(SellerCouponStateException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleCouponState(
            SellerCouponStateException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "SELLER_COUPON_STATE_ERROR"
                        )
                );
    }

    // =========================================================
    // COUPON VALIDATION
    // =========================================================

    @ExceptionHandler(SellerCouponValidationException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleCouponValidation(
            SellerCouponValidationException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "SELLER_COUPON_VALIDATION_ERROR"
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