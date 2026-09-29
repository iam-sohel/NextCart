package com.gesmio.havlook.seller_module.sellerBank.controller;

import com.gesmio.havlook.common.dto.CommonResponseDto;
import com.gesmio.havlook.seller_module.auth.SellerAuthorizationService;
import com.gesmio.havlook.seller_module.sellerBank.dto.SellerBankRequest;
import com.gesmio.havlook.seller_module.sellerBank.dto.SellerBankResponse;
import com.gesmio.havlook.seller_module.sellerBank.service.SellerBankService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sellers/bank")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class SellerBankController {

    private final SellerBankService sellerBankService;

    private final SellerAuthorizationService sellerAuthorizationService;

    // =========================================================
    // ADD BANK ACCOUNT
    // =========================================================

    @PostMapping
    public ResponseEntity<CommonResponseDto<SellerBankResponse>>
    addBankAccount(
            Authentication authentication,
            @Valid @RequestBody SellerBankRequest request
    ) {

        Long userId =
                getUserId(authentication);

        sellerAuthorizationService
                .getAuthorizedSeller(userId);

        SellerBankResponse response =
                sellerBankService.addBankAccount(
                        userId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new CommonResponseDto<>(
                                true,
                                "Bank account added successfully",
                                response
                        )
                );
    }

    // =========================================================
    // GET MY BANK ACCOUNT
    // =========================================================

    @GetMapping
    public ResponseEntity<CommonResponseDto<SellerBankResponse>>
    getMyBankAccount(
            Authentication authentication
    ) {

        Long userId =
                getUserId(authentication);

        sellerAuthorizationService
                .getAuthorizedSeller(userId);

        SellerBankResponse response =
                sellerBankService.getMyBankAccount(
                        userId
                );

        return ResponseEntity
                .ok(
                        new CommonResponseDto<>(
                                true,
                                "Bank account retrieved successfully",
                                response
                        )
                );
    }

    // =========================================================
    // UPDATE BANK ACCOUNT
    // =========================================================

    @PutMapping
    public ResponseEntity<CommonResponseDto<SellerBankResponse>>
    updateBankAccount(
            Authentication authentication,
            @Valid @RequestBody SellerBankRequest request
    ) {

        Long userId =
                getUserId(authentication);

        sellerAuthorizationService
                .getAuthorizedSeller(userId);

        SellerBankResponse response =
                sellerBankService.updateBankAccount(
                        userId,
                        request
                );

        return ResponseEntity
                .ok(
                        new CommonResponseDto<>(
                                true,
                                "Bank account updated successfully",
                                response
                        )
                );
    }

    // =========================================================
    // DEACTIVATE BANK ACCOUNT
    // =========================================================

    @DeleteMapping
    public ResponseEntity<CommonResponseDto<Void>>
    deactivateBankAccount(
            Authentication authentication
    ) {

        Long userId =
                getUserId(authentication);

        sellerAuthorizationService
                .getAuthorizedSeller(userId);

        sellerBankService.deactivateBankAccount(
                userId
        );

        return ResponseEntity
                .ok(
                        new CommonResponseDto<>(
                                true,
                                "Bank account deactivated successfully",
                                null
                        )
                );
    }

    // =========================================================
    // AUTHENTICATED USER ID
    // =========================================================

    private Long getUserId(
            Authentication authentication
    ) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new AccessDeniedException(
                    "Authentication required"
            );
        }

        try {

            return Long.valueOf(
                    authentication.getName()
            );

        } catch (NumberFormatException ex) {

            throw new AccessDeniedException(
                    "Invalid authenticated user"
            );
        }
    }
}