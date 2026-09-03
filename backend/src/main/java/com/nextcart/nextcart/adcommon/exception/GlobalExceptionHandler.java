package com.nextcart.nextcart.adcommon.exception;

import com.nextcart.nextcart.adcommon.dto.ApiResponse;
import com.nextcart.nextcart.auth_module.exceptions.PendingRegistrationNotFoundException;
import com.nextcart.nextcart.auth_module.exceptions.RegistrationExpiredException;
import com.nextcart.nextcart.auth_module.exceptions.RegistrationVerificationException;
import com.nextcart.nextcart.brand_module.exceptions.BrandAlreadyExistsException;
import com.nextcart.nextcart.brand_module.exceptions.BrandNotFoundException;
import com.nextcart.nextcart.cart_module.exceptions.CartItemNotFoundException;
import com.nextcart.nextcart.cart_module.exceptions.CartNotFoundException;
import com.nextcart.nextcart.cart_module.exceptions.CartPriceNotFoundException;
import com.nextcart.nextcart.cart_module.exceptions.CartProductNotFoundException;
import com.nextcart.nextcart.cart_module.exceptions.CartProductVariantNotFoundException;
import com.nextcart.nextcart.cart_module.exceptions.InvalidCartQuantityException;
import com.nextcart.nextcart.category_module.exceptions.CategoryAlreadyExistsException;
import com.nextcart.nextcart.category_module.exceptions.CategoryInactiveException;
import com.nextcart.nextcart.category_module.exceptions.CategoryNotFoundException;
import com.nextcart.nextcart.inventory_module.exceptions.InsufficientStockException;
import com.nextcart.nextcart.inventory_module.exceptions.InventoryAlreadyExistsException;
import com.nextcart.nextcart.inventory_module.exceptions.InventoryNotFoundException;
import com.nextcart.nextcart.inventory_module.exceptions.InventoryValidationException;
import com.nextcart.nextcart.order_module.exceptions.InvalidOrderStatusException;
import com.nextcart.nextcart.order_module.exceptions.OrderCancellationException;
import com.nextcart.nextcart.order_module.exceptions.OrderNotFoundException;
import com.nextcart.nextcart.payment_module.PaymentGatewayException;
import com.nextcart.nextcart.payment_module.PaymentNotFoundException;
import com.nextcart.nextcart.payment_module.PaymentValidationException;
import com.nextcart.nextcart.payment_module.PaymentVerificationException;
import com.nextcart.nextcart.product_module.exceptions.InvalidPriceException;
import com.nextcart.nextcart.product_module.exceptions.ProductAlreadyExistsException;
import com.nextcart.nextcart.product_module.exceptions.ProductImageNotFoundException;
import com.nextcart.nextcart.product_module.exceptions.ProductNotFoundException;
import com.nextcart.nextcart.product_module.exceptions.ProductSpecificationAlreadyExistsException;
import com.nextcart.nextcart.product_module.exceptions.ProductSpecificationNotFoundException;
import com.nextcart.nextcart.product_module.exceptions.ProductValidationException;
import com.nextcart.nextcart.product_module.exceptions.ProductVariantAlreadyExistsException;
import com.nextcart.nextcart.product_module.exceptions.ProductVariantNotFoundException;
import com.nextcart.nextcart.product_module.exceptions.ProductVariantPriceAlreadyExistsException;
import com.nextcart.nextcart.product_module.exceptions.ProductVariantPriceNotFoundException;
import com.nextcart.nextcart.product_module.exceptions.VariantAttributeAlreadyExistsException;
import com.nextcart.nextcart.product_module.exceptions.VariantAttributeNotFoundException;
import com.nextcart.nextcart.subcategory_module.exceptions.SubCategoryAlreadyExistsException;
import com.nextcart.nextcart.subcategory_module.exceptions.SubCategoryNotFoundException;
import com.nextcart.nextcart.user_module.exception.InvalidPasswordException;
import com.nextcart.nextcart.user_module.exception.PasswordMismatchException;
import com.nextcart.nextcart.user_module.exception.UserAlreadyExistsException;
import com.nextcart.nextcart.user_module.exception.UserNotFoundException;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // =========================================================
    // USER
    // =========================================================

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleUserNotFound(
            UserNotFoundException exception) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                "USER_NOT_FOUND"
        );
    }


    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleUserAlreadyExists(
            UserAlreadyExistsException exception) {

        return buildError(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                "USER_ALREADY_EXISTS"
        );
    }


    @ExceptionHandler(InvalidPasswordException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleInvalidPassword(
            InvalidPasswordException exception) {

        return buildError(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                "INVALID_PASSWORD"
        );
    }


    @ExceptionHandler(PasswordMismatchException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handlePasswordMismatch(
            PasswordMismatchException exception) {

        return buildError(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                "PASSWORD_MISMATCH"
        );
    }


    // =========================================================
    // REGISTRATION
    // =========================================================

    @ExceptionHandler(PendingRegistrationNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handlePendingRegistrationNotFound(
            PendingRegistrationNotFoundException exception) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                "PENDING_REGISTRATION_NOT_FOUND"
        );
    }


    @ExceptionHandler(RegistrationExpiredException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleRegistrationExpired(
            RegistrationExpiredException exception) {

        return buildError(
                HttpStatus.GONE,
                exception.getMessage(),
                "REGISTRATION_EXPIRED"
        );
    }


    @ExceptionHandler(RegistrationVerificationException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleRegistrationVerification(
            RegistrationVerificationException exception) {

        return buildError(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                "REGISTRATION_VERIFICATION_FAILED"
        );
    }


    // =========================================================
    // CATEGORY
    // =========================================================

    @ExceptionHandler(CategoryAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleCategoryAlreadyExists(
            CategoryAlreadyExistsException exception) {

        return buildError(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                "CATEGORY_ALREADY_EXISTS"
        );
    }


    @ExceptionHandler(CategoryNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleCategoryNotFound(
            CategoryNotFoundException exception) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                "CATEGORY_NOT_FOUND"
        );
    }


    @ExceptionHandler(CategoryInactiveException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleCategoryInactive(
            CategoryInactiveException exception) {

        return buildError(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                "CATEGORY_INACTIVE"
        );
    }


    // =========================================================
    // SUBCATEGORY
    // =========================================================

    @ExceptionHandler(SubCategoryAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleSubCategoryAlreadyExists(
            SubCategoryAlreadyExistsException exception) {

        return buildError(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                "SUBCATEGORY_ALREADY_EXISTS"
        );
    }


    @ExceptionHandler(SubCategoryNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleSubCategoryNotFound(
            SubCategoryNotFoundException exception) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                "SUBCATEGORY_NOT_FOUND"
        );
    }


    // =========================================================
    // BRAND
    // =========================================================

    @ExceptionHandler(BrandAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleBrandAlreadyExists(
            BrandAlreadyExistsException exception) {

        return buildError(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                "BRAND_ALREADY_EXISTS"
        );
    }


    @ExceptionHandler(BrandNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleBrandNotFound(
            BrandNotFoundException exception) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                "BRAND_NOT_FOUND"
        );
    }


    // =========================================================
    // PRODUCT
    // =========================================================

    @ExceptionHandler(ProductAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleProductAlreadyExists(
            ProductAlreadyExistsException exception) {

        return buildError(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                "PRODUCT_ALREADY_EXISTS"
        );
    }


    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleProductNotFound(
            ProductNotFoundException exception) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                "PRODUCT_NOT_FOUND"
        );
    }


    @ExceptionHandler(ProductValidationException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleProductValidation(
            ProductValidationException exception) {

        return buildError(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                "PRODUCT_VALIDATION_ERROR"
        );
    }


    @ExceptionHandler(InvalidPriceException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleInvalidPrice(
            InvalidPriceException exception) {

        return buildError(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                "INVALID_PRICE"
        );
    }


    // =========================================================
    // PRODUCT VARIANT
    // =========================================================

    @ExceptionHandler(ProductVariantAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleProductVariantAlreadyExists(
            ProductVariantAlreadyExistsException exception) {

        return buildError(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                "PRODUCT_VARIANT_ALREADY_EXISTS"
        );
    }


    @ExceptionHandler(ProductVariantNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleProductVariantNotFound(
            ProductVariantNotFoundException exception) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                "PRODUCT_VARIANT_NOT_FOUND"
        );
    }


    // =========================================================
    // PRODUCT VARIANT PRICE
    // =========================================================

    @ExceptionHandler(ProductVariantPriceAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleProductVariantPriceAlreadyExists(
            ProductVariantPriceAlreadyExistsException exception) {

        return buildError(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                "PRODUCT_VARIANT_PRICE_ALREADY_EXISTS"
        );
    }


    @ExceptionHandler(ProductVariantPriceNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleProductVariantPriceNotFound(
            ProductVariantPriceNotFoundException exception) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                "PRODUCT_VARIANT_PRICE_NOT_FOUND"
        );
    }


    // =========================================================
    // PRODUCT IMAGE
    // =========================================================

    @ExceptionHandler(ProductImageNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleProductImageNotFound(
            ProductImageNotFoundException exception) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                "PRODUCT_IMAGE_NOT_FOUND"
        );
    }


    // =========================================================
    // PRODUCT SPECIFICATION
    // =========================================================

    @ExceptionHandler(ProductSpecificationAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleProductSpecificationAlreadyExists(
            ProductSpecificationAlreadyExistsException exception) {

        return buildError(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                "PRODUCT_SPECIFICATION_ALREADY_EXISTS"
        );
    }


    @ExceptionHandler(ProductSpecificationNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleProductSpecificationNotFound(
            ProductSpecificationNotFoundException exception) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                "PRODUCT_SPECIFICATION_NOT_FOUND"
        );
    }


    // =========================================================
    // VARIANT ATTRIBUTE
    // =========================================================

    @ExceptionHandler(VariantAttributeAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleVariantAttributeAlreadyExists(
            VariantAttributeAlreadyExistsException exception) {

        return buildError(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                "VARIANT_ATTRIBUTE_ALREADY_EXISTS"
        );
    }


    @ExceptionHandler(VariantAttributeNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleVariantAttributeNotFound(
            VariantAttributeNotFoundException exception) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                "VARIANT_ATTRIBUTE_NOT_FOUND"
        );
    }


    // =========================================================
    // INVENTORY
    // =========================================================

    @ExceptionHandler(InventoryAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleInventoryAlreadyExists(
            InventoryAlreadyExistsException exception) {

        return buildError(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                "INVENTORY_ALREADY_EXISTS"
        );
    }


    @ExceptionHandler(InventoryNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleInventoryNotFound(
            InventoryNotFoundException exception) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                "INVENTORY_NOT_FOUND"
        );
    }


    @ExceptionHandler(InventoryValidationException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleInventoryValidation(
            InventoryValidationException exception) {

        return buildError(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                "INVENTORY_VALIDATION_ERROR"
        );
    }


    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleInsufficientStock(
            InsufficientStockException exception) {

        return buildError(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                "INSUFFICIENT_STOCK"
        );
    }


    // =========================================================
    // CART
    // =========================================================

    @ExceptionHandler(CartNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleCartNotFound(
            CartNotFoundException exception) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                "CART_NOT_FOUND"
        );
    }


    @ExceptionHandler(CartItemNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleCartItemNotFound(
            CartItemNotFoundException exception) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                "CART_ITEM_NOT_FOUND"
        );
    }


    @ExceptionHandler(CartProductNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleCartProductNotFound(
            CartProductNotFoundException exception) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                "CART_PRODUCT_NOT_FOUND"
        );
    }


    @ExceptionHandler(CartProductVariantNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleCartProductVariantNotFound(
            CartProductVariantNotFoundException exception) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                "CART_PRODUCT_VARIANT_NOT_FOUND"
        );
    }


    @ExceptionHandler(CartPriceNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleCartPriceNotFound(
            CartPriceNotFoundException exception) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                "CART_PRICE_NOT_FOUND"
        );
    }


    @ExceptionHandler(InvalidCartQuantityException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleInvalidCartQuantity(
            InvalidCartQuantityException exception) {

        return buildError(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                "INVALID_CART_QUANTITY"
        );
    }


    // =========================================================
    // ORDER
    // =========================================================

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleOrderNotFound(
            OrderNotFoundException exception) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                "ORDER_NOT_FOUND"
        );
    }


    @ExceptionHandler(OrderCancellationException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleOrderCancellation(
            OrderCancellationException exception) {

        return buildError(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                "ORDER_CANCELLATION_NOT_ALLOWED"
        );
    }


    @ExceptionHandler(InvalidOrderStatusException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleInvalidOrderStatus(
            InvalidOrderStatusException exception) {

        return buildError(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                "INVALID_ORDER_STATUS"
        );
    }


    // =========================================================
    // PAYMENT
    // =========================================================

    @ExceptionHandler(PaymentNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handlePaymentNotFound(
            PaymentNotFoundException exception) {

        return buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                "PAYMENT_NOT_FOUND"
        );
    }


    @ExceptionHandler(PaymentValidationException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handlePaymentValidation(
            PaymentValidationException exception) {

        return buildError(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                "PAYMENT_VALIDATION_ERROR"
        );
    }


    @ExceptionHandler(PaymentVerificationException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handlePaymentVerification(
            PaymentVerificationException exception) {

        return buildError(
                HttpStatus.UNPROCESSABLE_ENTITY,
                exception.getMessage(),
                "PAYMENT_VERIFICATION_FAILED"
        );
    }


    @ExceptionHandler(PaymentGatewayException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handlePaymentGateway(
            PaymentGatewayException exception) {

        log.error(
                "Payment gateway operation failed",
                exception
        );

        return buildError(
                HttpStatus.BAD_GATEWAY,
                "Payment gateway is temporarily unavailable",
                "PAYMENT_GATEWAY_ERROR"
        );
    }


    // =========================================================
    // REQUEST VALIDATION
    // =========================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleMethodArgumentNotValid(
            MethodArgumentNotValidException exception) {

        String message =
                exception.getBindingResult()
                        .getFieldErrors()
                        .stream()
                        .map(error ->
                                error.getField()
                                        + ": "
                                        + error.getDefaultMessage()
                        )
                        .collect(Collectors.joining(", "));

        return buildError(
                HttpStatus.BAD_REQUEST,
                message,
                "VALIDATION_ERROR"
        );
    }


    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleConstraintViolation(
            ConstraintViolationException exception) {

        String message =
                exception.getConstraintViolations()
                        .stream()
                        .map(violation ->
                                violation.getPropertyPath()
                                        + ": "
                                        + violation.getMessage()
                        )
                        .collect(Collectors.joining(", "));

        return buildError(
                HttpStatus.BAD_REQUEST,
                message,
                "VALIDATION_ERROR"
        );
    }


    // =========================================================
    // INVALID JSON
    // =========================================================

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleInvalidRequestBody(
            HttpMessageNotReadableException exception) {

        log.warn(
                "Invalid request body",
                exception
        );

        return buildError(
                HttpStatus.BAD_REQUEST,
                "Invalid request body",
                "INVALID_REQUEST_BODY"
        );
    }


    // =========================================================
    // DATABASE CONSTRAINT
    // =========================================================

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleDataIntegrityViolation(
            DataIntegrityViolationException exception) {

        log.error(
                "Database constraint violation",
                exception
        );

        return buildError(
                HttpStatus.CONFLICT,
                "Request could not be completed because it conflicts with existing data",
                "DATA_INTEGRITY_VIOLATION"
        );
    }


    // =========================================================
    // GENERIC EXCEPTION
    // =========================================================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleGenericException(
            Exception exception) {

        log.error(
                "Unexpected application error",
                exception
        );

        return buildError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred",
                "INTERNAL_SERVER_ERROR"
        );
    }


    // =========================================================
    // COMMON ERROR RESPONSE
    // =========================================================

    private ResponseEntity<ApiResponse<Map<String, String>>> buildError(
            HttpStatus status,
            String message,
            String errorCode) {

        ApiResponse<Map<String, String>> response =
                new ApiResponse<>(
                        false,
                        message,
                        Map.of(
                                "errorCode",
                                errorCode
                        )
                );

        return ResponseEntity
                .status(status)
                .body(response);
    }
}