package com.nextcart.nextcart.admin_module.controller;

import com.nextcart.nextcart.admin_module.service.AdminCustomerService;
import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.customer_module.dto.CustomerResponse;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/customers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
public class AdminCustomerController {

    private final AdminCustomerService adminCustomerService;

    // =========================================================
    // GET ALL CUSTOMERS
    // =========================================================

    @GetMapping
    public ResponseEntity<
            CommonResponseDto<Page<CustomerResponse>>
            >
    getAllCustomers(
            @PageableDefault(
                    size = 20,
                    sort = "id",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {

        Page<CustomerResponse> response =
                adminCustomerService.getAllCustomers(
                        pageable
                );

        return ResponseEntity
                .ok(
                        new CommonResponseDto<>(
                                true,
                                "Customers fetched successfully",
                                response
                        )
                );
    }

    // =========================================================
    // GET CUSTOMER BY ID
    // =========================================================

    @GetMapping("/{customerId}")
    public ResponseEntity<CommonResponseDto<CustomerResponse>>
    getCustomerById(
            @PathVariable Long customerId
    ) {

        CustomerResponse response =
                adminCustomerService.getCustomerById(
                        customerId
                );

        return ResponseEntity
                .ok(
                        new CommonResponseDto<>(
                                true,
                                "Customer fetched successfully",
                                response
                        )
                );
    }

    // =========================================================
    // ACTIVATE CUSTOMER
    // =========================================================

    @PutMapping("/{customerId}/activate")
    public ResponseEntity<CommonResponseDto<Void>>
    activateCustomer(
            @PathVariable Long customerId
    ) {

        adminCustomerService.activateCustomer(
                customerId
        );

        return ResponseEntity
                .ok(
                        new CommonResponseDto<>(
                                true,
                                "Customer activated successfully",
                                null
                        )
                );
    }

    // =========================================================
    // DEACTIVATE CUSTOMER
    // =========================================================

    @PutMapping("/{customerId}/deactivate")
    public ResponseEntity<CommonResponseDto<Void>>
    deactivateCustomer(
            @PathVariable Long customerId
    ) {

        adminCustomerService.deactivateCustomer(
                customerId
        );

        return ResponseEntity
                .ok(
                        new CommonResponseDto<>(
                                true,
                                "Customer deactivated successfully",
                                null
                        )
                );
    }
}