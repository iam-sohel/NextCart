package com.nextcart.nextcart.customer_module.controller;

import com.nextcart.nextcart.auth_module.security.CustomUserDetails;
import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.customer_module.dto.CustomerResponse;
import com.nextcart.nextcart.customer_module.dto.CustomerUpdateRequest;
import com.nextcart.nextcart.customer_module.exceptions.CustomerUserNotFoundException;
import com.nextcart.nextcart.customer_module.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerController {

    private final CustomerService customerService;

    // =========================================================
    // GET MY PROFILE
    // =========================================================

    @GetMapping("/me")
    public ResponseEntity<CommonResponseDto<CustomerResponse>> getMyProfile(
            Authentication authentication
    ) {

        Long userId = getAuthenticatedUserId(authentication);

        CustomerResponse response =
                customerService.getMyProfile(userId);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(
                        new CommonResponseDto<>(
                                true,
                                "Customer profile retrieved successfully",
                                response
                        )
                );
    }

    // =========================================================
    // UPDATE MY PROFILE
    // =========================================================

    @PutMapping("/me")
    public ResponseEntity<CommonResponseDto<CustomerResponse>> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody CustomerUpdateRequest request
    ) {

        Long userId = getAuthenticatedUserId(authentication);

        CustomerResponse response =
                customerService.updateMyProfile(
                        userId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(
                        new CommonResponseDto<>(
                                true,
                                "Customer profile updated successfully",
                                response
                        )
                );
    }

    // =========================================================
    // DEACTIVATE MY ACCOUNT
    // =========================================================

    @PatchMapping("/me/deactivate")
    public ResponseEntity<CommonResponseDto<Void>> deactivateMyAccount(
            Authentication authentication
    ) {

        Long userId = getAuthenticatedUserId(authentication);

        customerService.deactivateMyAccount(userId);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(
                        new CommonResponseDto<>(
                                true,
                                "Customer account deactivated successfully",
                                null
                        )
                );
    }

    // =========================================================
    // AUTHENTICATED USER
    // =========================================================

    private Long getAuthenticatedUserId(
            Authentication authentication
    ) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new CustomerUserNotFoundException(
                    "Authenticated customer is required"
            );
        }

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof CustomUserDetails userDetails)) {

            throw new CustomerUserNotFoundException(
                    "Authenticated customer details are unavailable"
            );
        }

        Long userId = userDetails.getUserId();

        if (userId == null || userId <= 0) {

            throw new CustomerUserNotFoundException(
                    "Authenticated customer ID is invalid"
            );
        }

        return userId;
    }
}