package com.nextcart.nextcart.seller_module.product;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerProductVariantResponse {

    private Long id;

    private String sku;

    private String status;

    private List<SellerProductVariantAttributeResponse> attributes;

    private SellerProductVariantPriceResponse price;

    private List<SellerProductInventoryResponse> inventories;
}