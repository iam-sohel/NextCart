package com.nextcart.nextcart.admin_module.controller;

import com.nextcart.nextcart.admin_module.service.AdminSellerService;
import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.seller_module.seller.dto.SellerResponse;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/sellers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
public class AdminSellerController {

    private final AdminSellerService adminSellerService;

    // =========================================================
    // GET ALL SELLERS
    // =========================================================

    @GetMapping
    public ResponseEntity<
            CommonResponseDto<Page<SellerResponse>>
            >
    getAllSellers(
            @PageableDefault(
                    size = 20,
                    sort = "id",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {

        Page<SellerResponse> response =
                adminSellerService.getAllSellers(
                        pageable
                );

        return ResponseEntity
                .ok(
                        new CommonResponseDto<>(
                                true,
                                "Sellers fetched successfully",
                                response
                        )
                );
    }

    // =========================================================
    // GET SELLER BY ID
    // =========================================================

    @GetMapping("/{sellerId}")
    public ResponseEntity<
            CommonResponseDto<SellerResponse>
            >
    getSellerById(
            @PathVariable Long sellerId
    ) {

        SellerResponse response =
                adminSellerService.getSellerById(
                        sellerId
                );

        return ResponseEntity
                .ok(
                        new CommonResponseDto<>(
                                true,
                                "Seller fetched successfully",
                                response
                        )
                );
    }

    // =========================================================
    // ACTIVATE SELLER
    // =========================================================

    @PutMapping("/{sellerId}/activate")
    public ResponseEntity<CommonResponseDto<Void>>
    activateSeller(
            @PathVariable Long sellerId
    ) {

        adminSellerService.activateSeller(
                sellerId
        );

        return ResponseEntity
                .ok(
                        new CommonResponseDto<>(
                                true,
                                "Seller activated successfully",
                                null
                        )
                );
    }

    // =========================================================
    // DEACTIVATE SELLER
    // =========================================================

    @PutMapping("/{sellerId}/deactivate")
    public ResponseEntity<CommonResponseDto<Void>>
    deactivateSeller(
            @PathVariable Long sellerId
    ) {

        adminSellerService.deactivateSeller(
                sellerId
        );

        return ResponseEntity
                .ok(
                        new CommonResponseDto<>(
                                true,
                                "Seller deactivated successfully",
                                null
                        )
                );
    }
}