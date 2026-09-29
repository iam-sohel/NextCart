package com.gesmio.havlook.seller_module.product.controller;

import com.gesmio.havlook.common.dto.CommonResponseDto;
import com.gesmio.havlook.seller_module.auth.SellerAuthorizationService;
import com.gesmio.havlook.seller_module.product.dto.SellerProductCreateRequest;
import com.gesmio.havlook.seller_module.product.dto.SellerProductResponse;
import com.gesmio.havlook.seller_module.product.service.SellerProductService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/sellers/products")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class SellerProductController {

    private final SellerProductService sellerProductService;
    private final SellerAuthorizationService sellerAuthorizationService;

    // =========================================================
    // CREATE PRODUCT
    // =========================================================

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<CommonResponseDto<SellerProductResponse>> createProduct(

            @RequestPart("productData")
            SellerProductCreateRequest request,

            @RequestPart(
                    value = "images",
                    required = false
            )
            MultipartFile[] images,

            Authentication authentication
    ) {

        Long userId = getUserId(authentication);

        sellerAuthorizationService.getAuthorizedSeller(userId);

        SellerProductResponse response =
                sellerProductService.createProduct(
                        userId,
                        request,
                        images
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new CommonResponseDto<>(
                                true,
                                "Product created successfully",
                                response
                        )
                );
    }

    // =========================================================
    // GET AUTHENTICATED USER ID
    // =========================================================

    private Long getUserId(Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new AccessDeniedException(
                    "Authentication required"
            );
        }

        String authenticatedUserId = authentication.getName();

        try {

            Long userId = Long.valueOf(authenticatedUserId);

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