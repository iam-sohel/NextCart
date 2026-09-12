package com.nextcart.nextcart.seller_module.sellerBank.controller;

import com.nextcart.nextcart.common.dto.ApiResponse;
import com.nextcart.nextcart.seller_module.sellerBank.dto.SellerBankRequest;
import com.nextcart.nextcart.seller_module.sellerBank.dto.SellerBankResponse;
import com.nextcart.nextcart.seller_module.sellerBank.service.SellerBankService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sellers/bank")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class SellerBankController {

    private final SellerBankService sellerBankService;

    @PostMapping
    public ResponseEntity<ApiResponse<SellerBankResponse>>
    addBankAccount(
            Authentication authentication,
            @Valid @RequestBody SellerBankRequest request
    ) {

        Long userId =
                Long.valueOf(authentication.getName());

        SellerBankResponse response =
                sellerBankService.addBankAccount(
                        userId,
                        request
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Bank account added successfully",
                        response
                )
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<SellerBankResponse>>
    getMyBankAccount(
            Authentication authentication
    ) {

        Long userId =
                Long.valueOf(authentication.getName());

        SellerBankResponse response =
                sellerBankService.getMyBankAccount(
                        userId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Bank account retrieved successfully",
                        response
                )
        );
    }

    @PutMapping
    public ResponseEntity<ApiResponse<SellerBankResponse>>
    updateBankAccount(
            Authentication authentication,
            @Valid @RequestBody SellerBankRequest request
    ) {

        Long userId =
                Long.valueOf(authentication.getName());

        SellerBankResponse response =
                sellerBankService.updateBankAccount(
                        userId,
                        request
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Bank account updated successfully",
                        response
                )
        );
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>>
    deactivateBankAccount(
            Authentication authentication
    ) {

        Long userId =
                Long.valueOf(authentication.getName());

        sellerBankService.deactivateBankAccount(
                userId
        );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Bank account deactivated successfully",
                        null
                )
        );
    }
}