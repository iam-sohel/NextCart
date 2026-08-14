package com.nextcart.nextcart.adcommon.exception;

import com.nextcart.nextcart.exception.product.ProductAlreadyExistsException;
import com.nextcart.nextcart.exception.product.ProductNotFoundException;
import com.nextcart.nextcart.user_module.exceptions.UserAlreadyExistsException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // =========================
    // USER ALREADY EXISTS
    // =========================

    @ExceptionHandler(UserAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleUserAlreadyExists(
            UserAlreadyExistsException ex) {

        Map<String, Object> response = new HashMap<>();

        response.put("success", false);
        response.put("message", ex.getMessage());
        response.put("errorCode", "USER_ALREADY_EXISTS");

        return response;
    }

    // =========================
    // PRODUCT NOT FOUND
    // =========================

    @ExceptionHandler(ProductNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, Object> handleProductNotFound(
            ProductNotFoundException ex) {

        Map<String, Object> response = new HashMap<>();

        response.put("success", false);
        response.put("message", ex.getMessage());
        response.put("errorCode", "PRODUCT_NOT_FOUND");

        return response;
    }

    // =========================
    // PRODUCT ALREADY EXISTS
    // =========================

    @ExceptionHandler(ProductAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleProductAlreadyExists(
            ProductAlreadyExistsException ex) {

        Map<String, Object> response = new HashMap<>();

        response.put("success", false);
        response.put("message", ex.getMessage());
        response.put("errorCode", "PRODUCT_ALREADY_EXISTS");

        return response;
    }
}