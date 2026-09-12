package com.nextcart.nextcart.seller_module.inventory_module.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryResponse {

    private Long id;

    private Long warehouseId;

    private String warehouseName;

    private List<InventoryItemResponse> items;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}