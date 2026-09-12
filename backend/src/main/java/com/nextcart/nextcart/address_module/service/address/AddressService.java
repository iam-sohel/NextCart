package com.nextcart.nextcart.address_module.service.address;

import com.nextcart.nextcart.address_module.dto.AddressRequestDTO;
import com.nextcart.nextcart.address_module.dto.AddressResponseDTO;

import java.util.List;

public interface AddressService {

    AddressResponseDTO addAddress(
            Long userId,
            AddressRequestDTO requestDto
    );

    List<AddressResponseDTO> getUserAddresses(
            Long userId
    );

    AddressResponseDTO getAddressById(
            Long userId,
            Long addressId
    );

    AddressResponseDTO updateAddress(
            Long userId,
            Long addressId,
            AddressRequestDTO requestDto
    );

    void deleteAddress(
            Long userId,
            Long addressId
    );

    AddressResponseDTO setDefaultAddress(
            Long userId,
            Long addressId
    );
}