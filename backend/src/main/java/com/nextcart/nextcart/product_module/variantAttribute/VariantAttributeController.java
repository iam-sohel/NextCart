package com.nextcart.nextcart.product_module.variantAttribute;

import com.nextcart.nextcart.adcommon.dto.ApiResponse;
import com.nextcart.nextcart.product_module.variantAttribute.dto.VariantAttributeCreateRequest;
import com.nextcart.nextcart.product_module.variantAttribute.dto.VariantAttributeResponse;
import com.nextcart.nextcart.product_module.variantAttribute.dto.VariantAttributeUpdateRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/variant-attributes")
@RequiredArgsConstructor
public class VariantAttributeController {

    private final VariantAttributeService variantAttributeService;

    // =========================================================
    // CREATE ATTRIBUTE
    // ADMIN + SELLER
    // =========================================================

    @PostMapping("/variant/{variantId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<VariantAttributeResponse>>
    createAttribute(
            @PathVariable Long variantId,
            @Valid @RequestBody VariantAttributeCreateRequest request) {

        VariantAttributeResponse response =
                variantAttributeService.createAttribute(
                        variantId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Variant attribute created successfully",
                        response
                ));
    }

    // =========================================================
    // GET ATTRIBUTE BY ID
    // ADMIN + SELLER
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<VariantAttributeResponse>>
    getAttributeById(
            @PathVariable Long id) {

        VariantAttributeResponse response =
                variantAttributeService.getAttributeById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Variant attribute fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET ATTRIBUTES BY VARIANT
    // ADMIN + SELLER
    // =========================================================

    @GetMapping("/variant/{variantId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<List<VariantAttributeResponse>>>
    getAttributesByVariant(
            @PathVariable Long variantId) {

        List<VariantAttributeResponse> response =
                variantAttributeService.getAttributesByVariant(
                        variantId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Variant attributes fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // UPDATE ATTRIBUTE
    // ADMIN + SELLER
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<VariantAttributeResponse>>
    updateAttribute(
            @PathVariable Long id,
            @Valid @RequestBody VariantAttributeUpdateRequest request) {

        VariantAttributeResponse response =
                variantAttributeService.updateAttribute(
                        id,
                        request
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Variant attribute updated successfully",
                        response
                )
        );
    }

    // =========================================================
    // DELETE ATTRIBUTE
    // ADMIN + SELLER
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ApiResponse<Void>>
    deleteAttribute(
            @PathVariable Long id) {

        variantAttributeService.deleteAttribute(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Variant attribute deleted successfully",
                        null
                )
        );
    }
}