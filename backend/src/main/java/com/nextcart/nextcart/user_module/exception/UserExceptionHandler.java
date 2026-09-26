package com.nextcart.nextcart.user_module.exception;

import com.nextcart.nextcart.common.dto.CommonResponseDto;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(
        basePackages = "com.nextcart.nextcart.user_module.controller"
)
public class UserExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleUserNotFound(
            UserNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "USER_NOT_FOUND"
                )
        );
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleDuplicateResource(
            DuplicateResourceException ex) {

        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "DUPLICATE_RESOURCE"
                )
        );
    }

    @ExceptionHandler(InvalidPasswordException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleInvalidPassword(
            InvalidPasswordException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "INVALID_PASSWORD"
                )
        );
    }

    @ExceptionHandler(PasswordMismatchException.class)
    public ResponseEntity<CommonResponseDto<Void>> handlePasswordMismatch(
            PasswordMismatchException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "PASSWORD_MISMATCH"
                )
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleValidation(
            MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Validation failed");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new CommonResponseDto<>(
                        false,
                        message,
                        null,
                        "VALIDATION_ERROR"
                )
        );
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleConstraintViolation(
            ConstraintViolationException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "VALIDATION_ERROR"
                )
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleInvalidRequestBody(
            HttpMessageNotReadableException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new CommonResponseDto<>(
                        false,
                        "Invalid request body",
                        null,
                        "INVALID_REQUEST_BODY"
                )
        );
    }
}