package com.nextcart.nextcart.seller_module.product;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/sellers/products")
@RequiredArgsConstructor
public class SellerProductController {

    private final SellerProductService sellerProductService;

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> createProduct(
            @RequestPart("productData")
            SellerProductCreateRequest request,

            @RequestPart(value = "images", required = false)
            MultipartFile[] images,

            Authentication authentication
    ) {

        Long userId = Long.valueOf(authentication.getName());

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
}