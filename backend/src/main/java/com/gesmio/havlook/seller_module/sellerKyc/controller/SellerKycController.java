package com.gesmio.havlook.seller_module.sellerKyc.controller;

import com.gesmio.havlook.auth_module.security.CustomUserDetails;
import com.gesmio.havlook.common.dto.CommonResponseDto;
import com.gesmio.havlook.seller_module.sellerKyc.dto.SellerKycRequest;
import com.gesmio.havlook.seller_module.sellerKyc.dto.SellerKycResponse;
import com.gesmio.havlook.seller_module.sellerKyc.service.SellerKycService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
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
    public ResponseEntity<CommonResponseDto<SellerKycResponse>> submitKyc(
            Authentication authentication,
            @Valid @RequestBody SellerKycRequest request
    ) {

        Long userId = getUserId(authentication);

        SellerKycResponse response =
                sellerKycService.submitKyc(
                        userId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new CommonResponseDto<>(
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
    public ResponseEntity<CommonResponseDto<SellerKycResponse>> getMyKyc(
            Authentication authentication
    ) {

        Long userId = getUserId(authentication);

        SellerKycResponse response =
                sellerKycService.getMyKyc(userId);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
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
    public ResponseEntity<CommonResponseDto<SellerKycResponse>> updateKyc(
            Authentication authentication,
            @Valid @RequestBody SellerKycRequest request
    ) {

        Long userId = getUserId(authentication);

        SellerKycResponse response =
                sellerKycService.updateKyc(
                        userId,
                        request
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
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
    public ResponseEntity<CommonResponseDto<SellerKycResponse>>
    getKycStatus(
            Authentication authentication
    ) {

        Long userId = getUserId(authentication);

        SellerKycResponse response =
                sellerKycService.getKycStatus(userId);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
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
    public ResponseEntity<CommonResponseDto<SellerKycResponse>>
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

        Long userId = getUserId(authentication);

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
                new CommonResponseDto<>(
                        true,
                        "KYC documents uploaded successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET AUTHENTICATED USER ID
    // =========================================================

    private Long getUserId(
            Authentication authentication
    ) {

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new AccessDeniedException(
                    "Authentication required"
            );
        }

        Object principal =
                authentication.getPrincipal();

        if (principal instanceof CustomUserDetails userDetails) {

            Long userId = userDetails.getUserId();

            if (userId == null || userId <= 0) {
                throw new AccessDeniedException(
                        "Authenticated user ID is invalid"
                );
            }

            return userId;
        }

        try {

            Long userId =
                    Long.valueOf(authentication.getName());

            if (userId <= 0) {
                throw new AccessDeniedException(
                        "Authenticated user ID is invalid"
                );
            }

            return userId;

        } catch (NumberFormatException ex) {

            throw new AccessDeniedException(
                    "Authenticated user ID is invalid"
            );
        }
    }
}