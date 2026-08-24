package com.nextcart.nextcart.product_module.productPrice;

import com.nextcart.nextcart.product_module.productPrice.dto.ProductVariantPriceCreateRequest;
import com.nextcart.nextcart.product_module.productPrice.dto.ProductVariantPriceResponse;
import com.nextcart.nextcart.product_module.productPrice.dto.ProductVariantPriceUpdateRequest;
import org.springframework.stereotype.Component;

@Component
public class ProductVariantPriceMapper {

    public ProductVariantPriceEntity toEntity(
            ProductVariantPriceCreateRequest request) {

        return ProductVariantPriceEntity.builder()
                .mrp(request.getMrp())
                .sellingPrice(request.getSellingPrice())
                .currency(request.getCurrency().trim().toUpperCase())
                .build();
    }

    public ProductVariantPriceResponse toResponse(
            ProductVariantPriceEntity price) {

        return ProductVariantPriceResponse.builder()
                .id(price.getId())
                .productVariantId(
                        price.getProductVariant().getId()
                )
                .mrp(price.getMrp())
                .sellingPrice(price.getSellingPrice())
                .currency(price.getCurrency())
                .build();
    }

    public void updateEntity(
            ProductVariantPriceUpdateRequest request,
            ProductVariantPriceEntity price) {

        price.setMrp(request.getMrp());
        price.setSellingPrice(request.getSellingPrice());
    }
}