package com.nextcart.nextcart.seller_module.sellerKyc.controller;

import com.nextcart.nextcart.common.dto.ApiResponse;
import com.nextcart.nextcart.seller_module.sellerKyc.dto.SellerKycRequest;
import com.nextcart.nextcart.seller_module.sellerKyc.dto.SellerKycResponse;
import com.nextcart.nextcart.seller_module.sellerKyc.service.SellerKycService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/sellers/kyc")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class SellerKycController {

    private final SellerKycService sellerKycService;


    // =========================================================
    // SUBMIT KYC DETAILS
    // =========================================================

    @PostMapping
    public ResponseEntity<ApiResponse<SellerKycResponse>> submitKyc(
            Authentication authentication,
            @Valid @RequestBody SellerKycRequest request
    ) {

        Long userId =
                Long.valueOf(authentication.getName());

        SellerKycResponse response =
                sellerKycService.submitKyc(
                        userId,
                        request
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "KYC details submitted successfully",
                        response
                )
        );
    }


    // =========================================================
    // GET MY KYC
    // =========================================================

    @GetMapping
    public ResponseEntity<ApiResponse<SellerKycResponse>> getMyKyc(
            Authentication authentication
    ) {

        Long userId =
                Long.valueOf(authentication.getName());

        SellerKycResponse response =
                sellerKycService.getMyKyc(userId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "KYC details retrieved successfully",
                        response
                )
        );
    }


    // =========================================================
    // UPDATE KYC
    // =========================================================

    @PutMapping
    public ResponseEntity<ApiResponse<SellerKycResponse>> updateKyc(
            Authentication authentication,
            @Valid @RequestBody SellerKycRequest request
    ) {

        Long userId =
                Long.valueOf(authentication.getName());

        SellerKycResponse response =
                sellerKycService.updateKyc(
                        userId,
                        request
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "KYC details updated successfully",
                        response
                )
        );
    }


    // =========================================================
    // GET KYC STATUS
    // =========================================================

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<SellerKycResponse>> getKycStatus(
            Authentication authentication
    ) {

        Long userId =
                Long.valueOf(authentication.getName());

        SellerKycResponse response =
                sellerKycService.getKycStatus(userId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "KYC status retrieved successfully",
                        response
                )
        );
    }


    // =========================================================
    // UPLOAD KYC DOCUMENTS
    // =========================================================

    @PostMapping(
            value = "/documents",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<SellerKycResponse>>
    uploadKycDocuments(
            Authentication authentication,

            @RequestPart(
                    value = "panDocument",
                    required = false
            )
            MultipartFile panDocument,

            @RequestPart(
                    value = "aadhaarDocument",
                    required = false
            )
            MultipartFile aadhaarDocument,

            @RequestPart(
                    value = "gstDocument",
                    required = false
            )
            MultipartFile gstDocument,

            @RequestPart(
                    value = "registrationDocument",
                    required = false
            )
            MultipartFile registrationDocument,

            @RequestPart(
                    value = "addressDocument",
                    required = false
            )
            MultipartFile addressDocument
    ) {

        Long userId =
                Long.valueOf(authentication.getName());

        SellerKycResponse response =
                sellerKycService.uploadKycDocuments(
                        userId,
                        panDocument,
                        aadhaarDocument,
                        gstDocument,
                        registrationDocument,
                        addressDocument
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "KYC documents uploaded successfully",
                        response
                )
        );
    }
}