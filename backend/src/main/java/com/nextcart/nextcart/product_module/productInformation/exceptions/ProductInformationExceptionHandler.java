package com.nextcart.nextcart.product_module.productInformation.exceptions;

import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.product_module.product_base.exceptions.ProductNotFoundException;

import jakarta.validation.ConstraintViolationException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(
        basePackages = "com.nextcart.nextcart.product_module.productInformation"
)
public class ProductInformationExceptionHandler {

    // =========================================================
    // PRODUCT INFORMATION NOT FOUND
    // =========================================================

    @ExceptionHandler(ProductInformationNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleProductInformationNotFound(
            ProductInformationNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "PRODUCT_INFORMATION_NOT_FOUND"
                        )
                );
    }

    // =========================================================
    // PRODUCT INFORMATION ALREADY EXISTS
    // =========================================================

    @ExceptionHandler(ProductInformationAlreadyExistsException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleProductInformationAlreadyExists(
            ProductInformationAlreadyExistsException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "PRODUCT_INFORMATION_ALREADY_EXISTS"
                        )
                );
    }

    // =========================================================
    // PRODUCT NOT FOUND
    // =========================================================

    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleProductNotFound(
            ProductNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "PRODUCT_NOT_FOUND"
                        )
                );
    }

    // =========================================================
    // VALIDATION ERROR
    // =========================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleValidationException(
            MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error ->
                        error.getField() + ": " + error.getDefaultMessage()
                )
                .orElse("Validation failed");

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
    // CONSTRAINT VIOLATION
    // =========================================================

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleConstraintViolation(
            ConstraintViolationException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
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
            HttpMessageNotReadableException ex) {

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