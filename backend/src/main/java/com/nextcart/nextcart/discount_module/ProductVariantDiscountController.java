package com.nextcart.nextcart.discount_module;

import com.nextcart.nextcart.discount_module.dto.ProductVariantDiscountResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/product-variant-discounts")
@RequiredArgsConstructor
public class ProductVariantDiscountController {

    private final ProductVariantDiscountService discountService;

    @GetMapping("/variant/{productVariantId}/current")
    public ResponseEntity<ProductVariantDiscountResponse> getCurrentDiscount(
            @PathVariable Long productVariantId) {

        return ResponseEntity.ok(
                discountService.getCurrentDiscount(productVariantId)
        );
    }
}