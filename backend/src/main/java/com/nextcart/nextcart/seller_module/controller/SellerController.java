package com.nextcart.nextcart.seller_module.controller;

import com.nextcart.nextcart.seller_module.dto.SellerBankAccountRequest;
import com.nextcart.nextcart.seller_module.dto.SellerBankAccountResponse;
import com.nextcart.nextcart.seller_module.dto.SellerKycRequest;
import com.nextcart.nextcart.seller_module.dto.SellerKycResponse;
import com.nextcart.nextcart.seller_module.dto.SellerResponse;
import com.nextcart.nextcart.seller_module.service.SellerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/sellers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SELLER')")
public class SellerController {

    private final SellerService sellerService;

    @GetMapping("/me")
    public ResponseEntity<SellerResponse> getMyProfile(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                sellerService.getMySellerProfile(
                        authentication.getName()
                )
        );
    }

    @PostMapping(
            value = "/me/kyc",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<SellerKycResponse> submitKyc(
            Authentication authentication,

            @RequestPart(required = false)
            String panNumber,

            @RequestPart(required = false)
            String aadhaarNumber,

            @RequestPart(required = false)
            String gstNumber,

            @RequestPart(required = false)
            MultipartFile panDocument,

            @RequestPart(required = false)
            MultipartFile aadhaarDocument,

            @RequestPart(required = false)
            MultipartFile gstDocument
    ) {

        SellerKycRequest request = SellerKycRequest.builder()
                .panNumber(panNumber)
                .aadhaarNumber(aadhaarNumber)
                .gstNumber(gstNumber)
                .panDocument(panDocument)
                .aadhaarDocument(aadhaarDocument)
                .gstDocument(gstDocument)
                .build();

        return ResponseEntity.ok(
                sellerService.submitKyc(
                        authentication.getName(),
                        request
                )
        );
    }

    @GetMapping("/me/kyc")
    public ResponseEntity<SellerKycResponse> getMyKyc(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                sellerService.getMyKyc(
                        authentication.getName()
                )
        );
    }

    @PostMapping("/me/bank-account")
    public ResponseEntity<SellerBankAccountResponse> addBankAccount(
            Authentication authentication,
            @Valid @RequestBody SellerBankAccountRequest request
    ) {
        return ResponseEntity.ok(
                sellerService.addBankAccount(
                        authentication.getName(),
                        request
                )
        );
    }

    @GetMapping("/me/bank-account")
    public ResponseEntity<SellerBankAccountResponse> getMyBankAccount(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                sellerService.getMyBankAccount(
                        authentication.getName()
                )
        );
    }

    @PatchMapping(
            value = "/me/kyc/documents",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Void> updateKycDocuments(
            Authentication authentication,

            @RequestPart(required = false)
            MultipartFile panDocument,

            @RequestPart(required = false)
            MultipartFile aadhaarDocument,

            @RequestPart(required = false)
            MultipartFile gstDocument
    ) {

        sellerService.updateKycDocuments(
                authentication.getName(),
                panDocument,
                aadhaarDocument,
                gstDocument
        );

        return ResponseEntity.noContent().build();
    }
}