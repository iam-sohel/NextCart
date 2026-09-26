package com.nextcart.nextcart.brand_module.controller;

import com.nextcart.nextcart.brand_module.dto.BrandCreateRequest;
import com.nextcart.nextcart.brand_module.dto.BrandResponse;
import com.nextcart.nextcart.brand_module.dto.BrandUpdateRequest;
import com.nextcart.nextcart.brand_module.service.BrandService;
import com.nextcart.nextcart.common.dto.CommonResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

    // =========================================================
    // CREATE BRAND
    // =========================================================

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonResponseDto<BrandResponse>> createBrand(
            @Valid @RequestBody BrandCreateRequest request) {

        BrandResponse response =
                brandService.createBrand(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new CommonResponseDto<>(
                                true,
                                "Brand created successfully",
                                response
                        )
                );
    }

    // =========================================================
    // GET BRAND BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<CommonResponseDto<BrandResponse>> getBrandById(
            @PathVariable Long id) {

        BrandResponse response =
                brandService.getBrandById(id);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Brand fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET ALL BRANDS
    // =========================================================

    @GetMapping
    public ResponseEntity<CommonResponseDto<Page<BrandResponse>>> getAllBrands(
            @PageableDefault(
                    size = 20,
                    sort = "name",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable) {

        Page<BrandResponse> response =
                brandService.getAllBrands(pageable);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Brands fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // UPDATE BRAND
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonResponseDto<BrandResponse>> updateBrand(
            @PathVariable Long id,
            @Valid @RequestBody BrandUpdateRequest request) {

        BrandResponse response =
                brandService.updateBrand(id, request);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Brand updated successfully",
                        response
                )
        );
    }

    // =========================================================
    // DEACTIVATE BRAND
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonResponseDto<Void>> deactivateBrand(
            @PathVariable Long id) {

        brandService.deactivateBrand(id);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Brand deactivated successfully",
                        null
                )
        );
    }

    // =========================================================
    // RESTORE BRAND
    // =========================================================

    @PatchMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonResponseDto<BrandResponse>> restoreBrand(
            @PathVariable Long id) {

        BrandResponse response =
                brandService.restoreBrand(id);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Brand restored successfully",
                        response
                )
        );
    }
}