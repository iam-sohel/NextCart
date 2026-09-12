package com.nextcart.nextcart.seller_module.warehouse_module.service;

import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import com.nextcart.nextcart.seller_module.seller.repository.SellerRepository;
import com.nextcart.nextcart.seller_module.warehouse_module.dto.WarehouseCreateRequest;
import com.nextcart.nextcart.seller_module.warehouse_module.dto.WarehouseResponse;
import com.nextcart.nextcart.seller_module.warehouse_module.dto.WarehouseUpdateRequest;
import com.nextcart.nextcart.seller_module.warehouse_module.entity.Warehouse;
import com.nextcart.nextcart.seller_module.warehouse_module.entity.WarehouseStatus;
import com.nextcart.nextcart.seller_module.warehouse_module.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final SellerRepository sellerRepository;

    @Override
    public WarehouseResponse createWarehouse(
            Long userId,
            WarehouseCreateRequest request
    ) {

        Seller seller = getSeller(userId);

        Warehouse warehouse = Warehouse.builder()
                .seller(seller)
                .warehouseName(request.getWarehouseName())
                .contactPerson(request.getContactPerson())
                .phoneNumber(request.getPhoneNumber())
                .streetAddress(request.getStreetAddress())
                .landmark(request.getLandmark())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .country(request.getCountry())
                .status(WarehouseStatus.ACTIVE)
                .build();

        Warehouse savedWarehouse =
                warehouseRepository.save(warehouse);

        return mapToResponse(savedWarehouse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseResponse> getMyWarehouses(
            Long userId
    ) {

        Seller seller = getSeller(userId);

        return warehouseRepository
                .findBySellerOrderByCreatedAtDesc(seller)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public WarehouseResponse getMyWarehouse(
            Long userId,
            Long warehouseId
    ) {

        Seller seller = getSeller(userId);

        Warehouse warehouse =
                warehouseRepository
                        .findByIdAndSeller(warehouseId, seller)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Warehouse not found"
                                )
                        );

        return mapToResponse(warehouse);
    }

    @Override
    public WarehouseResponse updateMyWarehouse(
            Long userId,
            Long warehouseId,
            WarehouseUpdateRequest request
    ) {

        Seller seller = getSeller(userId);

        Warehouse warehouse =
                warehouseRepository
                        .findByIdAndSeller(warehouseId, seller)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Warehouse not found"
                                )
                        );

        if (request.getWarehouseName() != null) {
            warehouse.setWarehouseName(
                    request.getWarehouseName()
            );
        }

        if (request.getContactPerson() != null) {
            warehouse.setContactPerson(
                    request.getContactPerson()
            );
        }

        if (request.getPhoneNumber() != null) {
            warehouse.setPhoneNumber(
                    request.getPhoneNumber()
            );
        }

        if (request.getStreetAddress() != null) {
            warehouse.setStreetAddress(
                    request.getStreetAddress()
            );
        }

        if (request.getLandmark() != null) {
            warehouse.setLandmark(
                    request.getLandmark()
            );
        }

        if (request.getCity() != null) {
            warehouse.setCity(
                    request.getCity()
            );
        }

        if (request.getState() != null) {
            warehouse.setState(
                    request.getState()
            );
        }

        if (request.getPostalCode() != null) {
            warehouse.setPostalCode(
                    request.getPostalCode()
            );
        }

        if (request.getCountry() != null) {
            warehouse.setCountry(
                    request.getCountry()
            );
        }

        return mapToResponse(warehouse);
    }

    @Override
    public void deactivateWarehouse(
            Long userId,
            Long warehouseId
    ) {

        Seller seller = getSeller(userId);

        Warehouse warehouse =
                warehouseRepository
                        .findByIdAndSeller(warehouseId, seller)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Warehouse not found"
                                )
                        );

        warehouse.setStatus(WarehouseStatus.INACTIVE);
    }

    private Seller getSeller(Long userId) {

        return sellerRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Seller profile not found"
                        )
                );
    }

    private WarehouseResponse mapToResponse(
            Warehouse warehouse
    ) {

        return WarehouseResponse.builder()
                .id(warehouse.getId())
                .sellerId(warehouse.getSeller().getId())
                .warehouseName(warehouse.getWarehouseName())
                .contactPerson(warehouse.getContactPerson())
                .phoneNumber(warehouse.getPhoneNumber())
                .streetAddress(warehouse.getStreetAddress())
                .landmark(warehouse.getLandmark())
                .city(warehouse.getCity())
                .state(warehouse.getState())
                .postalCode(warehouse.getPostalCode())
                .country(warehouse.getCountry())
                .status(warehouse.getStatus())
                .createdAt(warehouse.getCreatedAt())
                .updatedAt(warehouse.getUpdatedAt())
                .build();
    }
}