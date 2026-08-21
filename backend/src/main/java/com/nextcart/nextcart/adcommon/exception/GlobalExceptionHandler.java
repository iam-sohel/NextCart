package com.nextcart.nextcart.adcommon.exception;

import com.nextcart.nextcart.brand_module.exceptions.BrandAlreadyExistsException;
import com.nextcart.nextcart.brand_module.exceptions.BrandNotFoundException;
import com.nextcart.nextcart.category_module.exceptions.CategoryAlreadyExistsException;
import com.nextcart.nextcart.category_module.exceptions.CategoryNotFoundException;
import com.nextcart.nextcart.inventory_module.exceptions.InventoryAlreadyExistsException;
import com.nextcart.nextcart.inventory_module.exceptions.InventoryNotFoundException;
import com.nextcart.nextcart.product_module.exceptions.*;
import com.nextcart.nextcart.subcategory_module.exceptions.SubCategoryAlreadyExistsException;
import com.nextcart.nextcart.subcategory_module.exceptions.SubCategoryNotFoundException;
import com.nextcart.nextcart.user_module.exceptions.UserAlreadyExistsException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleUserAlreadyExists(
            UserAlreadyExistsException ex) {

        return Map.of(
                "success", false,
                "message", ex.getMessage(),
                "errorCode", "USER_ALREADY_EXISTS"
        );
    }

    @ExceptionHandler(CategoryAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleCategoryAlreadyExists(
            CategoryAlreadyExistsException ex) {

        return Map.of(
                "success", false,
                "message", ex.getMessage(),
                "errorCode", "CATEGORY_ALREADY_EXISTS"
        );
    }

    @ExceptionHandler(CategoryNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, Object> handleCategoryNotFound(CategoryNotFoundException ex)
    {
        return Map.of(
                "success", false,
                "message", ex.getMessage(),
                "errorCode", "CATEGORY_NOT_FOUND"
        );

    }

    // =========================
    // SUBCATEGORY ALREADY EXISTS
    // =========================

    @ExceptionHandler(SubCategoryAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleSubCategoryAlreadyExists(
            SubCategoryAlreadyExistsException ex) {

        return Map.of(
                "success", false,
                "message", ex.getMessage(),
                "errorCode", "SUBCATEGORY_ALREADY_EXISTS"
        );
    }


// =========================
// SUBCATEGORY NOT FOUND
// =========================

    @ExceptionHandler(SubCategoryNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, Object> handleSubCategoryNotFound(
            SubCategoryNotFoundException ex) {

        return Map.of(
                "success", false,
                "message", ex.getMessage(),
                "errorCode", "SUBCATEGORY_NOT_FOUND"
        );
    }


// =========================
// BRAND ALREADY EXISTS
// =========================

    @ExceptionHandler(BrandAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleBrandAlreadyExists(
            BrandAlreadyExistsException ex) {

        return Map.of(
                "success", false,
                "message", ex.getMessage(),
                "errorCode", "BRAND_ALREADY_EXISTS"
        );
    }


// =========================
// BRAND NOT FOUND
// =========================

    @ExceptionHandler(BrandNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, Object> handleBrandNotFound(
            BrandNotFoundException ex) {

        return Map.of(
                "success", false,
                "message", ex.getMessage(),
                "errorCode", "BRAND_NOT_FOUND"
        );
    }

    @ExceptionHandler(ProductAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleProductAlreadyExists(
            ProductAlreadyExistsException ex) {

        return Map.of(
                "success", false,
                "message", ex.getMessage(),
                "errorCode", "PRODUCT_ALREADY_EXISTS"
        );
    }
    @ExceptionHandler(ProductNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, Object> handleProductNotFound(
            ProductNotFoundException ex) {

        return Map.of(
                "success", false,
                "message", ex.getMessage(),
                "errorCode", "PRODUCT_NOT_FOUND"
        );
    }

    @ExceptionHandler(ProductVariantAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleProductVariantAlreadyExists(
            ProductVariantAlreadyExistsException ex) {

        return Map.of(
                "success", false,
                "message", ex.getMessage(),
                "errorCode", "PRODUCT_VARIANT_ALREADY_EXISTS"
        );
    }
    @ExceptionHandler(InventoryAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleInventoryAlreadyExists(
            InventoryAlreadyExistsException ex) {

        return Map.of(
                "success", false,
                "message", ex.getMessage(),
                "errorCode", "INVENTORY_ALREADY_EXISTS"
        );
    }

    @ExceptionHandler(InventoryNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, Object> handleInventoryNotFound(
            InventoryNotFoundException ex) {

        return Map.of(
                "success", false,
                "message", ex.getMessage(),
                "errorCode", "INVENTORY_NOT_FOUND"
        );
    }

    @ExceptionHandler(ProductImageNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, Object> handleProductImageNotFound(
            ProductImageNotFoundException ex) {

        return Map.of(
                "success", false,
                "message", ex.getMessage(),
                "errorCode", "PRODUCT_IMAGE_NOT_FOUND"
        );
    }
    @ExceptionHandler(ProductSpecificationNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, Object> handleProductSpecificationNotFound(
            ProductSpecificationNotFoundException ex) {

        return Map.of(
                "success", false,
                "message", ex.getMessage(),
                "errorCode", "PRODUCT_SPECIFICATION_NOT_FOUND"
        );
    }
    @ExceptionHandler(VariantAttributeAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleVariantAttributeAlreadyExists(
            VariantAttributeAlreadyExistsException ex) {

        return Map.of(
                "success", false,
                "message", ex.getMessage(),
                "errorCode", "VARIANT_ATTRIBUTE_ALREADY_EXISTS"
        );
    }
    @ExceptionHandler(VariantAttributeNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, Object> handleVariantAttributeNotFound(
            VariantAttributeNotFoundException ex) {

        return Map.of(
                "success", false,
                "message", ex.getMessage(),
                "errorCode", "VARIANT_ATTRIBUTE_NOT_FOUND"
        );
    }

    @ExceptionHandler(ProductInformationAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleProductInformationAlreadyExists(
            ProductInformationAlreadyExistsException ex) {

        return Map.of(
                "success", false,
                "message", ex.getMessage(),
                "errorCode", "PRODUCT_INFORMATION_ALREADY_EXISTS"
        );
    }

    @ExceptionHandler(ProductInformationNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, Object> handleProductInformationNotFound(
            ProductInformationNotFoundException ex) {

        return Map.of(
                "success", false,
                "message", ex.getMessage(),
                "errorCode", "PRODUCT_INFORMATION_NOT_FOUND"
        );
    }

}