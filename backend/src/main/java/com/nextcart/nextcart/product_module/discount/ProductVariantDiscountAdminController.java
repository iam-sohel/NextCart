package com.nextcart.nextcart.product_module.discount;

import com.nextcart.nextcart.product_module.discount.dto.ProductVariantDiscountCreateRequest;
import com.nextcart.nextcart.product_module.discount.dto.ProductVariantDiscountResponse;
import com.nextcart.nextcart.product_module.discount.dto.ProductVariantDiscountUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/product-variant-discounts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ProductVariantDiscountAdminController {

    private final ProductVariantDiscountService discountService;

    @PostMapping
    public ResponseEntity<ProductVariantDiscountResponse> createDiscount(
            @Valid @RequestBody ProductVariantDiscountCreateRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(discountService.createDiscount(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductVariantDiscountResponse> getDiscountById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                discountService.getDiscountById(id)
        );
    }

    @GetMapping("/variant/{productVariantId}")
    public ResponseEntity<List<ProductVariantDiscountResponse>>
    getDiscountsByVariant(
            @PathVariable Long productVariantId) {

        return ResponseEntity.ok(
                discountService.getDiscountsByVariant(productVariantId)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductVariantDiscountResponse> updateDiscount(
            @PathVariable Long id,
            @Valid @RequestBody ProductVariantDiscountUpdateRequest request) {

        return ResponseEntity.ok(
                discountService.updateDiscount(id, request)
        );
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateDiscount(
            @PathVariable Long id) {

        discountService.deactivateDiscount(id);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<ProductVariantDiscountResponse> restoreDiscount(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                discountService.restoreDiscount(id)
        );
    }
}