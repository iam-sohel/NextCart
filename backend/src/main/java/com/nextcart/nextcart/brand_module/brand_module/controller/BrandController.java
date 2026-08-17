package com.nextcart.nextcart.brand_module.controller;

import com.nextcart.nextcart.brand_module.dto.*;
import com.nextcart.nextcart.brand_module.service.BrandService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

    @PostMapping
    public ResponseEntity<BrandResponse> createBrand(
            @Valid @RequestBody BrandCreateRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(brandService.createBrand(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrandResponse> getBrandById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                brandService.getBrandById(id)
        );
    }

    @GetMapping
    public ResponseEntity<List<BrandResponse>> getAllBrands() {

        return ResponseEntity.ok(
                brandService.getAllBrands()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<BrandResponse> updateBrand(
            @PathVariable Long id,
            @Valid @RequestBody BrandUpdateRequest request) {

        return ResponseEntity.ok(
                brandService.updateBrand(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrand(
            @PathVariable Long id) {

        brandService.deleteBrand(id);

        return ResponseEntity.noContent().build();
    }
}