package com.gesmio.havlook.seller_module.product.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerProductInventoryResponse {

    private Long id;

    private Long warehouseId;

    private Integer quantity;

    private Integer reservedQuantity;

    private Integer availableQuantity;

    private String stockStatus;
}