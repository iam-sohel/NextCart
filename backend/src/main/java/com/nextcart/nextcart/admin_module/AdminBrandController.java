package com.nextcart.nextcart.admin_module;

import com.nextcart.nextcart.brand_module.dto.BrandCreateRequest;
import com.nextcart.nextcart.brand_module.dto.BrandResponse;
import com.nextcart.nextcart.brand_module.dto.BrandUpdateRequest;
import com.nextcart.nextcart.brand_module.service.BrandService;
import com.nextcart.nextcart.common.dto.ApiResponse;
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
@RequestMapping("/api/v1/admin/brands")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminBrandController {

    private final BrandService brandService;

    @PostMapping
    public ResponseEntity<ApiResponse<BrandResponse>> createBrand(
            @Valid @RequestBody BrandCreateRequest request) {

        BrandResponse response =
                brandService.createBrand(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Brand created successfully",
                        response
                ));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<BrandResponse>>> getAllBrands(
            @PageableDefault(
                    size = 20,
                    sort = "name",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable) {

        Page<BrandResponse> response =
                brandService.getAllBrands(pageable);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Brands fetched successfully",
                        response
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandResponse>> getBrandById(
            @PathVariable Long id) {

        BrandResponse response =
                brandService.getBrandById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Brand fetched successfully",
                        response
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandResponse>> updateBrand(
            @PathVariable Long id,
            @Valid @RequestBody BrandUpdateRequest request) {

        BrandResponse response =
                brandService.updateBrand(id, request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Brand updated successfully",
                        response
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivateBrand(
            @PathVariable Long id) {

        brandService.deactivateBrand(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Brand deactivated successfully",
                        null
                )
        );
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<BrandResponse>> restoreBrand(
            @PathVariable Long id) {

        BrandResponse response =
                brandService.restoreBrand(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Brand restored successfully",
                        response
                )
        );
    }
}