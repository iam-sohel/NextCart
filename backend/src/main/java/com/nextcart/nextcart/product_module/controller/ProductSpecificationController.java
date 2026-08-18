package com.nextcart.nextcart.product_module.controller;

import com.nextcart.nextcart.product_module.dto.productSpecification.ProductSpecificationCreateRequest;
import com.nextcart.nextcart.product_module.dto.productSpecification.ProductSpecificationResponse;
import com.nextcart.nextcart.product_module.dto.productSpecification.ProductSpecificationUpdateRequest;
import com.nextcart.nextcart.product_module.service.ProductSpecificationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/product-specifications")
@RequiredArgsConstructor
public class ProductSpecificationController {

    private final ProductSpecificationService productSpecificationService;


    // =========================
    // CREATE SPECIFICATION
    // =========================

    @PostMapping
    public ResponseEntity<ProductSpecificationResponse>
    createSpecification(
            @Valid
            @RequestBody
            ProductSpecificationCreateRequest request) {

        ProductSpecificationResponse response =
                productSpecificationService.createSpecification(
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================
    // GET BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<ProductSpecificationResponse>
    getSpecificationById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                productSpecificationService
                        .getSpecificationById(id)
        );
    }


    // =========================
    // GET ALL
    // =========================

    @GetMapping
    public ResponseEntity<List<ProductSpecificationResponse>>
    getAllSpecifications() {

        return ResponseEntity.ok(
                productSpecificationService
                        .getAllSpecifications()
        );
    }


    // =========================
    // GET BY PRODUCT
    // =========================

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductSpecificationResponse>>
    getSpecificationsByProductId(
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                productSpecificationService
                        .getSpecificationsByProductId(
                                productId
                        )
        );
    }


    // =========================
    // UPDATE
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<ProductSpecificationResponse>
    updateSpecification(
            @PathVariable Long id,
            @Valid
            @RequestBody
            ProductSpecificationUpdateRequest request) {

        return ResponseEntity.ok(
                productSpecificationService.updateSpecification(
                        id,
                        request
                )
        );
    }


    // =========================
    // DELETE
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSpecification(
            @PathVariable Long id) {

        productSpecificationService.deleteSpecification(id);

        return ResponseEntity.noContent().build();
    }
}