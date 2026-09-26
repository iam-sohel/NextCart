package com.nextcart.nextcart.subcategory_module.exceptions;

import com.nextcart.nextcart.category_module.exceptions.CategoryNotFoundException;
import com.nextcart.nextcart.common.dto.CommonResponseDto;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(
        basePackages = "com.nextcart.nextcart.subcategory_module.controller"
)
public class SubCategoryExceptionHandler {

    @ExceptionHandler(SubCategoryNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleSubCategoryNotFound(
            SubCategoryNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "SUBCATEGORY_NOT_FOUND"
                )
        );
    }

    @ExceptionHandler(SubCategoryAlreadyExistsException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleSubCategoryAlreadyExists(
            SubCategoryAlreadyExistsException ex) {

        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "SUBCATEGORY_ALREADY_EXISTS"
                )
        );
    }

    @ExceptionHandler(SubCategoryCategoryInactiveException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleCategoryInactive(
            SubCategoryCategoryInactiveException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "SUBCATEGORY_CATEGORY_INACTIVE"
                )
        );
    }

    @ExceptionHandler(CategoryNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleCategoryNotFound(
            CategoryNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "CATEGORY_NOT_FOUND"
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