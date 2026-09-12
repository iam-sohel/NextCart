package com.nextcart.nextcart.customer_module.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerResponse {

    private Long customerId;

    private Long userId;

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private boolean active;
}