package com.gesmio.havlook.seller_module.seller.exceptions;

import com.gesmio.havlook.common.dto.CommonResponseDto;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(
        basePackages = "com.gesmio.havlook.seller_module.seller.controller"
)
public class SellerExceptionHandler {

    // =========================================================
    // SELLER NOT FOUND
    // =========================================================

    @ExceptionHandler(SellerNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleSellerNotFound(
            SellerNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "SELLER_NOT_FOUND"
                ));
    }

    // =========================================================
    // SELLER VALIDATION
    // =========================================================

    @ExceptionHandler(SellerValidationException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleSellerValidation(
            SellerValidationException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "SELLER_VALIDATION_ERROR"
                ));
    }

    // =========================================================
    // REQUEST VALIDATION
    // =========================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error ->
                        error.getField()
                                + ": "
                                + error.getDefaultMessage()
                )
                .orElse("Request validation failed");

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new CommonResponseDto<>(
                        false,
                        message,
                        null,
                        "VALIDATION_ERROR"
                ));
    }

    // =========================================================
    // CONSTRAINT VALIDATION
    // =========================================================

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleConstraintViolation(
            ConstraintViolationException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "VALIDATION_ERROR"
                ));
    }

    // =========================================================
    // INVALID REQUEST BODY
    // =========================================================

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleInvalidRequestBody(
            HttpMessageNotReadableException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new CommonResponseDto<>(
                        false,
                        "Invalid request body",
                        null,
                        "INVALID_REQUEST_BODY"
                ));
    }
}