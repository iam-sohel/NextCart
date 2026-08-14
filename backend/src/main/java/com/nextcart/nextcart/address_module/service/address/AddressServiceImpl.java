package com.nextcart.nextcart.address_module.service.address;

import com.nextcart.nextcart.address_module.dto.AddressRequestDTO;
import com.nextcart.nextcart.address_module.dto.AddressResponseDTO;
import com.nextcart.nextcart.address_module.entity.Address;
import com.nextcart.nextcart.user_module.entity.User;
import com.nextcart.nextcart.address_module.repository.AddressRepository;
import com.nextcart.nextcart.user_module.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public AddressResponseDTO addAddress(String userEmail, AddressRequestDTO requestDto) {
        User user = getUserByEmail(userEmail);

        boolean isFirstAddress = addressRepository.findByUserOrderByIsDefaultDescCreatedAtDesc(user).isEmpty();
        boolean setAsDefault = Boolean.TRUE.equals(requestDto.getIsDefault()) || isFirstAddress;

        if (setAsDefault) {
            addressRepository.resetDefaultAddressForUser(user);
        }

        Address address = Address.builder()
                .user(user)
                .fullName(requestDto.getFullName())
                .phoneNumber(requestDto.getPhoneNumber())
                .streetAddress(requestDto.getStreetAddress())
                .landmark(requestDto.getLandmark())
                .city(requestDto.getCity())
                .state(requestDto.getState())
                .postalCode(requestDto.getPostalCode())
                .country(requestDto.getCountry())
                .isDefault(setAsDefault)
                .build();

        Address savedAddress = addressRepository.save(address);
        return mapToResponseDto(savedAddress);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponseDTO> getUserAddresses(String userEmail) {
        User user = getUserByEmail(userEmail);
        return addressRepository.findByUserOrderByIsDefaultDescCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AddressResponseDTO getAddressById(String userEmail, Long addressId) {
        User user = getUserByEmail(userEmail);
        Address address = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new RuntimeException("Address not found or does not belong to user"));
        return mapToResponseDto(address);
    }

    @Override
    @Transactional
    public AddressResponseDTO updateAddress(String userEmail, Long addressId, AddressRequestDTO requestDto) {
        User user = getUserByEmail(userEmail);
        Address address = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new RuntimeException("Address not found or access denied"));

        if (Boolean.TRUE.equals(requestDto.getIsDefault()) && !address.getIsDefault()) {
            addressRepository.resetDefaultAddressForUser(user);
            address.setIsDefault(true);
        }

        address.setFullName(requestDto.getFullName());
        address.setPhoneNumber(requestDto.getPhoneNumber());
        address.setStreetAddress(requestDto.getStreetAddress());
        address.setLandmark(requestDto.getLandmark());
        address.setCity(requestDto.getCity());
        address.setState(requestDto.getState());
        address.setPostalCode(requestDto.getPostalCode());
        address.setCountry(requestDto.getCountry());

        Address updatedAddress = addressRepository.save(address);
        return mapToResponseDto(updatedAddress);
    }

    @Override
    @Transactional
    public void deleteAddress(String userEmail, Long addressId) {
        User user = getUserByEmail(userEmail);
        Address address = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new RuntimeException("Address not found or access denied"));

        boolean wasDefault = address.getIsDefault();
        addressRepository.delete(address);

        if (wasDefault) {
            List<Address> remaining = addressRepository.findByUserOrderByIsDefaultDescCreatedAtDesc(user);
            if (!remaining.isEmpty()) {
                Address newDefault = remaining.get(0);
                newDefault.setIsDefault(true);
                addressRepository.save(newDefault);
            }
        }
    }

    @Override
    @Transactional
    public AddressResponseDTO setDefaultAddress(String userEmail, Long addressId) {
        User user = getUserByEmail(userEmail);
        Address address = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new RuntimeException("Address not found or access denied"));

        addressRepository.resetDefaultAddressForUser(user);
        address.setIsDefault(true);

        Address updatedAddress = addressRepository.save(address);
        return mapToResponseDto(updatedAddress);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private AddressResponseDTO mapToResponseDto(Address address) {
        return AddressResponseDTO.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phoneNumber(address.getPhoneNumber())
                .streetAddress(address.getStreetAddress())
                .landmark(address.getLandmark())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .isDefault(address.getIsDefault())
                .createdAt(address.getCreatedAt())
                .updatedAt(address.getUpdatedAt())
                .build();
    }
}
