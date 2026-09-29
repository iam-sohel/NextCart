package com.gesmio.havlook.seller_module.warehouse_module.exceptions;

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
                "com.gesmio.havlook.seller_module.warehouse_module.controller"
)
public class WarehouseExceptionHandler {

    // =========================================================
    // WAREHOUSE NOT FOUND
    // =========================================================

    @ExceptionHandler(WarehouseNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleWarehouseNotFound(
            WarehouseNotFoundException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "WAREHOUSE_NOT_FOUND"
                        )
                );
    }

    // =========================================================
    // WAREHOUSE VALIDATION
    // =========================================================

    @ExceptionHandler(WarehouseValidationException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleWarehouseValidation(
            WarehouseValidationException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "WAREHOUSE_VALIDATION_ERROR"
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