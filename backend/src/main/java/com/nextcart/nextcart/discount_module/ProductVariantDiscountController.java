package com.nextcart.nextcart.discount_module;

import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.discount_module.dto.ProductVariantDiscountResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/product-variant-discounts")
@RequiredArgsConstructor
public class ProductVariantDiscountController {

    private final ProductVariantDiscountService discountService;

    @GetMapping("/variant/{productVariantId}/current")
    public ResponseEntity<CommonResponseDto<ProductVariantDiscountResponse>> getCurrentDiscount(
            @PathVariable Long productVariantId) {

        ProductVariantDiscountResponse response =
                discountService.getCurrentDiscount(productVariantId);

        return ResponseEntity.status(HttpStatus.OK).body(
                new CommonResponseDto<>(
                        true,
                        "Current product variant discount fetched successfully",
                        response
                )
        );
    }
}