package com.nextcart.nextcart.customer_module.exceptions;

import com.nextcart.nextcart.common.dto.CommonResponseDto;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(basePackages = "com.nextcart.nextcart.customer_module")
public class CustomerExceptionHandler {

    // =========================================================
    // CUSTOMER NOT FOUND
    // =========================================================

    @ExceptionHandler(CustomerNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleCustomerNotFound(CustomerNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new CommonResponseDto<>(false, ex.getMessage(), null, "CUSTOMER_NOT_FOUND"));
    }

    // =========================================================
    // USER NOT FOUND / INVALID USER
    // =========================================================

    @ExceptionHandler(CustomerUserNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleCustomerUserNotFound(CustomerUserNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new CommonResponseDto<>(false, ex.getMessage(), null, "CUSTOMER_USER_NOT_FOUND"));
    }

    // =========================================================
    // VALIDATION ERROR
    // =========================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleValidation(MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult().getFieldErrors().stream().findFirst().map(error -> error.getField() + ": " + error.getDefaultMessage()).orElse("Validation failed");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new CommonResponseDto<>(false, message, null, "VALIDATION_ERROR"));
    }

    // =========================================================
    // CONSTRAINT VIOLATION
    // =========================================================

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleConstraintViolation(ConstraintViolationException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new CommonResponseDto<>(false, ex.getMessage(), null, "VALIDATION_ERROR"));
    }

    // =========================================================
    // INVALID REQUEST BODY
    // =========================================================

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleInvalidRequestBody(HttpMessageNotReadableException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new CommonResponseDto<>(false, "Invalid request body", null, "INVALID_REQUEST_BODY"));
    }

    // =========================================================
    // CUSTOMER VALIDATION ERROR
    // =========================================================

    @ExceptionHandler(CustomerValidationException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleCustomerValidation(CustomerValidationException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new CommonResponseDto<>(false, ex.getMessage(), null, "CUSTOMER_VALIDATION_ERROR"));
    }
}