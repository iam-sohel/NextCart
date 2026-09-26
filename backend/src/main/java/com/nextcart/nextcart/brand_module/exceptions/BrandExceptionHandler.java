package com.nextcart.nextcart.brand_module.exceptions;

import com.nextcart.nextcart.common.dto.CommonResponseDto;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(
        basePackages = "com.nextcart.nextcart.brand_module.controller"
)
public class BrandExceptionHandler {

    // =========================================================
    // BRAND NOT FOUND
    // =========================================================

    @ExceptionHandler(BrandNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleBrandNotFound(
            BrandNotFoundException ex) {

        CommonResponseDto<Void> response =
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "BRAND_NOT_FOUND"
                );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);
    }

    // =========================================================
    // BRAND ALREADY EXISTS
    // =========================================================

    @ExceptionHandler(BrandAlreadyExistsException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleBrandAlreadyExists(
            BrandAlreadyExistsException ex) {

        CommonResponseDto<Void> response =
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "BRAND_ALREADY_EXISTS"
                );

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(response);
    }

    // =========================================================
    // VALIDATION ERROR
    // =========================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleValidationException(
            MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .orElse("Validation failed");

        CommonResponseDto<Void> response =
                new CommonResponseDto<>(
                        false,
                        message,
                        null,
                        "VALIDATION_ERROR"
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    // =========================================================
    // CONSTRAINT VIOLATION
    // =========================================================

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleConstraintViolation(
            ConstraintViolationException ex) {

        String message = ex.getConstraintViolations()
                .stream()
                .findFirst()
                .map(violation ->
                        violation.getPropertyPath()
                                + ": "
                                + violation.getMessage()
                )
                .orElse("Validation failed");

        CommonResponseDto<Void> response =
                new CommonResponseDto<>(
                        false,
                        message,
                        null,
                        "VALIDATION_ERROR"
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    // =========================================================
    // INVALID REQUEST BODY
    // =========================================================

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleInvalidRequestBody(
            HttpMessageNotReadableException ex) {

        CommonResponseDto<Void> response =
                new CommonResponseDto<>(
                        false,
                        "Invalid request body",
                        null,
                        "INVALID_REQUEST_BODY"
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }
}