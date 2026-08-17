package com.nextcart.nextcart.product_module.controller;


import com.nextcart.nextcart.product_module.dto.varaintAtrribute.VariantAttributeCreateRequest;
import com.nextcart.nextcart.product_module.dto.varaintAtrribute.VariantAttributeResponse;
import com.nextcart.nextcart.product_module.dto.varaintAtrribute.VariantAttributeUpdateRequest;
import com.nextcart.nextcart.product_module.service.VariantAttributeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/variant-attributes")
@RequiredArgsConstructor
public class VariantAttributeController {

    private final VariantAttributeService variantAttributeService;


    // =========================
    // CREATE ATTRIBUTE
    // =========================

    @PostMapping
    public ResponseEntity<VariantAttributeResponse> createAttribute(
            @Valid
            @RequestBody
            VariantAttributeCreateRequest request) {

        VariantAttributeResponse response =
                variantAttributeService.createAttribute(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================
    // GET ATTRIBUTE BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<VariantAttributeResponse> getAttributeById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                variantAttributeService.getAttributeById(id)
        );
    }


    // =========================
    // GET ALL ATTRIBUTES
    // =========================

    @GetMapping
    public ResponseEntity<List<VariantAttributeResponse>>
    getAllAttributes() {

        return ResponseEntity.ok(
                variantAttributeService.getAllAttributes()
        );
    }


    // =========================
    // GET BY VARIANT
    // =========================

    @GetMapping("/variant/{variantId}")
    public ResponseEntity<List<VariantAttributeResponse>>
    getAttributesByVariantId(
            @PathVariable Long variantId) {

        return ResponseEntity.ok(
                variantAttributeService
                        .getAttributesByVariantId(variantId)
        );
    }


    // =========================
    // UPDATE ATTRIBUTE
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<VariantAttributeResponse>
    updateAttribute(
            @PathVariable Long id,
            @Valid
            @RequestBody
            VariantAttributeUpdateRequest request) {

        return ResponseEntity.ok(
                variantAttributeService.updateAttribute(
                        id,
                        request
                )
        );
    }


    // =========================
    // DELETE ATTRIBUTE
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttribute(
            @PathVariable Long id) {

        variantAttributeService.deleteAttribute(id);

        return ResponseEntity.noContent().build();
    }
}