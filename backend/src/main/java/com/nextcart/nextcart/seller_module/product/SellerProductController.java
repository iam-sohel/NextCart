package com.nextcart.nextcart.seller_module.product;


import com.nextcart.nextcart.seller_module.auth.SellerAuthorizationService;
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
    public ResponseEntity<?> createProduct(

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

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        sellerProductService.createProduct(
                                userId,
                                request,
                                images
                        )
                );
    }


    // =========================================================
    // AUTHENTICATED USER ID
    // =========================================================

    private Long getUserId(Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new AccessDeniedException(
                    "Authentication required"
            );
        }

        return Long.valueOf(authentication.getName());
    }
}