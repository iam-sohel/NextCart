package com.nextcart.nextcart.seller_module.warehouse_module.dto;

import com.nextcart.nextcart.seller_module.warehouse_module.entity.WarehouseStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseResponse {

    private Long id;

    private Long sellerId;

    private String warehouseName;

    private String contactPerson;

    private String phoneNumber;

    private String streetAddress;

    private String landmark;

    private String city;

    private String state;

    private String postalCode;

    private String country;

    private WarehouseStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}