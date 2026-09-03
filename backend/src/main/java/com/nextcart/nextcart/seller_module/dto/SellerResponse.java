package com.nextcart.nextcart.seller_module.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerResponse {

    private Long id;

    private Long userId;

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private String businessName;

    private String gstNumber;

    private boolean verified;

    private boolean active;
}