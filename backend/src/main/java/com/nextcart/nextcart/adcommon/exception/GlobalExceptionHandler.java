package com.nextcart.nextcart.adcommon.exception;

import com.nextcart.nextcart.adcommon.dto.ApiResponse;
import com.nextcart.nextcart.brand_module.exceptions.BrandAlreadyExistsException;
import com.nextcart.nextcart.brand_module.exceptions.BrandNotFoundException;
import com.nextcart.nextcart.category_module.exceptions.CategoryAlreadyExistsException;
import com.nextcart.nextcart.category_module.exceptions.CategoryInactiveException;
import com.nextcart.nextcart.category_module.exceptions.CategoryNotFoundException;
import com.nextcart.nextcart.inventory_module.exceptions.InventoryAlreadyExistsException;
import com.nextcart.nextcart.inventory_module.exceptions.InventoryNotFoundException;
import com.nextcart.nextcart.product_module.exceptions.*;
import com.nextcart.nextcart.subcategory_module.exceptions.SubCategoryAlreadyExistsException;
import com.nextcart.nextcart.subcategory_module.exceptions.SubCategoryNotFoundException;
import com.nextcart.nextcart.user_module.exceptions.UserAlreadyExistsException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // =========================================================
    // USER
    // =========================================================

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleUserAlreadyExists(UserAlreadyExistsException ex) {

        return buildError(
                HttpStatus.CONFLICT,
                ex.getMessage(),
                "USER_ALREADY_EXISTS"
        );
    }


    // =========================================================
    // CATEGORY
    // =========================================================

    @ExceptionHandler(CategoryAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleCategoryAlreadyExists(CategoryAlreadyExistsException ex) {

        return buildError(
                HttpStatus.CONFLICT,
                ex.getMessage(),
                "CATEGORY_ALREADY_EXISTS"
        );
    }


    @ExceptionHandler(CategoryNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleCategoryNotFound(CategoryNotFoundException ex) {

        return buildError(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                "CATEGORY_NOT_FOUND"
        );
    }


    @ExceptionHandler(CategoryInactiveException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleCategoryInactive(CategoryInactiveException ex) {

        return buildError(
                HttpStatus.BAD_REQUEST,
                ex.getMessage(),
                "CATEGORY_INACTIVE"
        );
    }


    // =========================================================
    // SUBCATEGORY
    // =========================================================

    @ExceptionHandler(SubCategoryAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleSubCategoryAlreadyExists(
            SubCategoryAlreadyExistsException ex) {

        return buildError(
                HttpStatus.CONFLICT,
                ex.getMessage(),
                "SUBCATEGORY_ALREADY_EXISTS"
        );
    }


    @ExceptionHandler(SubCategoryNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleSubCategoryNotFound(
            SubCategoryNotFoundException ex) {

        return buildError(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                "SUBCATEGORY_NOT_FOUND"
        );
    }


    // =========================================================
    // BRAND
    // =========================================================

    @ExceptionHandler(BrandAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleBrandAlreadyExists(
            BrandAlreadyExistsException ex) {

        return buildError(
                HttpStatus.CONFLICT,
                ex.getMessage(),
                "BRAND_ALREADY_EXISTS"
        );
    }


    @ExceptionHandler(BrandNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleBrandNotFound(
            BrandNotFoundException ex) {

        return buildError(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                "BRAND_NOT_FOUND"
        );
    }


    // =========================================================
    // PRODUCT
    // =========================================================

    @ExceptionHandler(ProductAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleProductAlreadyExists(
            ProductAlreadyExistsException ex) {

        return buildError(
                HttpStatus.CONFLICT,
                ex.getMessage(),
                "PRODUCT_ALREADY_EXISTS"
        );
    }


    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleProductNotFound(
            ProductNotFoundException ex) {

        return buildError(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                "PRODUCT_NOT_FOUND"
        );
    }


    @ExceptionHandler(ProductValidationException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleProductValidation(
            ProductValidationException ex) {

        return buildError(
                HttpStatus.BAD_REQUEST,
                ex.getMessage(),
                "PRODUCT_VALIDATION_ERROR"
        );
    }


    @ExceptionHandler(InvalidPriceException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleInvalidPrice(
            InvalidPriceException ex) {

        return buildError(
                HttpStatus.BAD_REQUEST,
                ex.getMessage(),
                "INVALID_PRICE"
        );
    }


    // =========================================================
    // PRODUCT VARIANT
    // =========================================================

    @ExceptionHandler(ProductVariantAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleProductVariantAlreadyExists(
            ProductVariantAlreadyExistsException ex) {

        return buildError(
                HttpStatus.CONFLICT,
                ex.getMessage(),
                "PRODUCT_VARIANT_ALREADY_EXISTS"
        );
    }


    @ExceptionHandler(ProductVariantNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleProductVariantNotFound(
            ProductVariantNotFoundException ex) {

        return buildError(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                "PRODUCT_VARIANT_NOT_FOUND"
        );
    }


    // =========================================================
    // PRODUCT VARIANT PRICE
    // =========================================================

    @ExceptionHandler(ProductVariantPriceAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleProductVariantPriceAlreadyExists(
            ProductVariantPriceAlreadyExistsException ex) {

        return buildError(
                HttpStatus.CONFLICT,
                ex.getMessage(),
                "PRODUCT_VARIANT_PRICE_ALREADY_EXISTS"
        );
    }


    @ExceptionHandler(ProductVariantPriceNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleProductVariantPriceNotFound(
            ProductVariantPriceNotFoundException ex) {

        return buildError(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                "PRODUCT_VARIANT_PRICE_NOT_FOUND"
        );
    }


    // =========================================================
    // PRODUCT IMAGE
    // =========================================================

    @ExceptionHandler(ProductImageNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleProductImageNotFound(
            ProductImageNotFoundException ex) {

        return buildError(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                "PRODUCT_IMAGE_NOT_FOUND"
        );
    }


    // =========================================================
    // PRODUCT SPECIFICATION
    // =========================================================

    @ExceptionHandler(ProductSpecificationAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleProductSpecificationAlreadyExists(
            ProductSpecificationAlreadyExistsException ex) {

        return buildError(
                HttpStatus.CONFLICT,
                ex.getMessage(),
                "PRODUCT_SPECIFICATION_ALREADY_EXISTS"
        );
    }


    @ExceptionHandler(ProductSpecificationNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleProductSpecificationNotFound(
            ProductSpecificationNotFoundException ex) {

        return buildError(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                "PRODUCT_SPECIFICATION_NOT_FOUND"
        );
    }


    // =========================================================
    // VARIANT ATTRIBUTE
    // =========================================================

    @ExceptionHandler(VariantAttributeAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleVariantAttributeAlreadyExists(
            VariantAttributeAlreadyExistsException ex) {

        return buildError(
                HttpStatus.CONFLICT,
                ex.getMessage(),
                "VARIANT_ATTRIBUTE_ALREADY_EXISTS"
        );
    }


    @ExceptionHandler(VariantAttributeNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleVariantAttributeNotFound(
            VariantAttributeNotFoundException ex) {

        return buildError(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                "VARIANT_ATTRIBUTE_NOT_FOUND"
        );
    }


    // =========================================================
    // INVENTORY
    // =========================================================

    @ExceptionHandler(InventoryAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleInventoryAlreadyExists(
            InventoryAlreadyExistsException ex) {

        return buildError(
                HttpStatus.CONFLICT,
                ex.getMessage(),
                "INVENTORY_ALREADY_EXISTS"
        );
    }


    @ExceptionHandler(InventoryNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleInventoryNotFound(
            InventoryNotFoundException ex) {

        return buildError(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                "INVENTORY_NOT_FOUND"
        );
    }


    // =========================================================
    // VALIDATION
    // =========================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleValidationException(
            MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Validation failed");

        return buildError(
                HttpStatus.BAD_REQUEST,
                message,
                "VALIDATION_ERROR"
        );
    }


    // =========================================================
    // GENERIC EXCEPTION
    // =========================================================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleGenericException(Exception ex) {

        return buildError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred",
                "INTERNAL_SERVER_ERROR"
        );
    }


    // =========================================================
    // COMMON ERROR BUILDER
    // =========================================================

    private ResponseEntity<ApiResponse<Map<String, String>>> buildError(
            HttpStatus status,
            String message,
            String errorCode) {

        ApiResponse<Map<String, String>> response =
                new ApiResponse<>(
                        false,
                        message,
                        Map.of("errorCode", errorCode)
                );

        return ResponseEntity
                .status(status)
                .body(response);
    }
}