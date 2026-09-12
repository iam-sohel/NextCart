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


    /**
     * Submit KYC details
     */
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


    /**
     * Get my KYC details
     */
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


    /**
     * Update KYC details
     */
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


    /**
     * Upload KYC PDF documents
     */
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
            MultipartFile gstDocument
    ) {

        Long userId =
                Long.valueOf(authentication.getName());

        SellerKycResponse response =
                sellerKycService.uploadKycDocuments(
                        userId,
                        panDocument,
                        aadhaarDocument,
                        gstDocument
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