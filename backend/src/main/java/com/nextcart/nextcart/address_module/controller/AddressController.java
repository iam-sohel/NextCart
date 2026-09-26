package com.nextcart.nextcart.address_module.controller;

import com.nextcart.nextcart.address_module.dto.AddressRequestDTO;
import com.nextcart.nextcart.address_module.dto.AddressResponseDTO;
import com.nextcart.nextcart.address_module.service.AddressService;
import com.nextcart.nextcart.common.dto.CommonResponseDto;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class AddressController {

    private final AddressService addressService;


    // =========================================================
    // ADD ADDRESS
    // =========================================================

    @PostMapping
    public ResponseEntity<CommonResponseDto<AddressResponseDTO>> addAddress(
            Authentication authentication,
            @Valid @RequestBody AddressRequestDTO requestDto
    ) {

        Long userId = Long.valueOf(authentication.getName());

        AddressResponseDTO response =
                addressService.addAddress(
                        userId,
                        requestDto
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Address added successfully",
                        response
                )
        );
    }


    // =========================================================
    // GET ALL ADDRESSES
    // =========================================================

    @GetMapping
    public ResponseEntity<CommonResponseDto<List<AddressResponseDTO>>>
    getUserAddresses(
            Authentication authentication
    ) {

        Long userId = Long.valueOf(authentication.getName());

        List<AddressResponseDTO> response =
                addressService.getUserAddresses(userId);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Addresses retrieved successfully",
                        response
                )
        );
    }


    // =========================================================
    // GET ADDRESS BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<CommonResponseDto<AddressResponseDTO>>
    getAddressById(
            Authentication authentication,
            @PathVariable Long id
    ) {

        Long userId = Long.valueOf(authentication.getName());

        AddressResponseDTO response =
                addressService.getAddressById(
                        userId,
                        id
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Address retrieved successfully",
                        response
                )
        );
    }


    // =========================================================
    // UPDATE ADDRESS
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<CommonResponseDto<AddressResponseDTO>>
    updateAddress(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequestDTO requestDto
    ) {

        Long userId = Long.valueOf(authentication.getName());

        AddressResponseDTO response =
                addressService.updateAddress(
                        userId,
                        id,
                        requestDto
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Address updated successfully",
                        response
                )
        );
    }


    // =========================================================
    // DELETE ADDRESS
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<CommonResponseDto<Void>>
    deleteAddress(
            Authentication authentication,
            @PathVariable Long id
    ) {

        Long userId = Long.valueOf(authentication.getName());

        addressService.deleteAddress(
                userId,
                id
        );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Address deleted successfully",
                        null
                )
        );
    }


    // =========================================================
    // SET DEFAULT ADDRESS
    // =========================================================

    @PatchMapping("/{id}/default")
    public ResponseEntity<CommonResponseDto<AddressResponseDTO>>
    setDefaultAddress(
            Authentication authentication,
            @PathVariable Long id
    ) {

        Long userId = Long.valueOf(authentication.getName());

        AddressResponseDTO response =
                addressService.setDefaultAddress(
                        userId,
                        id
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Default address updated successfully",
                        response
                )
        );
    }
}