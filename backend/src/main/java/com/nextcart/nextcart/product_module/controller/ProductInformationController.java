package com.nextcart.nextcart.product_module.controller;

import com.nextcart.nextcart.product_module.dto.product_information.ProductInformationRequestDTO;
import com.nextcart.nextcart.product_module.dto.product_information.ProductInformationResponseDTO;
import com.nextcart.nextcart.product_module.service.ProductInformationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/product-information")
@RequiredArgsConstructor
public class ProductInformationController {

    private final ProductInformationService productInformationService;

    @PostMapping
    public ResponseEntity<ProductInformationResponseDTO> createProductInformation(
            @Valid @RequestBody ProductInformationRequestDTO requestDTO) {

        ProductInformationResponseDTO response =
                productInformationService.createProductInformation(requestDTO);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ProductInformationResponseDTO> getProductInformation(
            @PathVariable Long productId) {

        ProductInformationResponseDTO response =
                productInformationService.getProductInformation(productId);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{productId}")
    public ResponseEntity<ProductInformationResponseDTO> updateProductInformation(
            @PathVariable Long productId,
            @Valid @RequestBody ProductInformationRequestDTO requestDTO) {

        ProductInformationResponseDTO response =
                productInformationService.updateProductInformation(
                        productId, requestDTO);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProductInformation(
            @PathVariable Long productId) {

        productInformationService.deleteProductInformation(productId);

        return ResponseEntity.noContent().build();
    }
}