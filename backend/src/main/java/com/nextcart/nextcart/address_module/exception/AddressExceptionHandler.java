package com.nextcart.nextcart.address_module.exception;

import com.nextcart.nextcart.common.dto.CommonResponseDto;

import jakarta.validation.ConstraintViolationException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@RestControllerAdvice(
        basePackages = "com.nextcart.nextcart.address_module.controller"
)
public class AddressExceptionHandler {


    // ============================================================
    // ADDRESS NOT FOUND
    // ============================================================

    @ExceptionHandler(AddressNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleAddressNotFound(
            AddressNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "ADDRESS_NOT_FOUND"
                        )
                );
    }


    // ============================================================
    // CUSTOMER PROFILE NOT FOUND
    // ============================================================

    @ExceptionHandler(CustomerProfileNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleCustomerProfileNotFound(
            CustomerProfileNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "CUSTOMER_PROFILE_NOT_FOUND"
                        )
                );
    }


    // ============================================================
    // VALIDATION ERROR
    // ============================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleValidationException(
            MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Invalid request");

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


    // ============================================================
    // CONSTRAINT VALIDATION
    // ============================================================

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleConstraintViolation(
            ConstraintViolationException ex) {

        String message = ex.getConstraintViolations()
                .stream()
                .findFirst()
                .map(violation -> violation.getMessage())
                .orElse("Invalid request");

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


    // ============================================================
    // INVALID JSON / REQUEST BODY
    // ============================================================

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