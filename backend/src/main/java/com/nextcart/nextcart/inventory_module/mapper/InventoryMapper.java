package com.nextcart.nextcart.inventory_module.mapper;



import com.nextcart.nextcart.inventory_module.dto.InventoryCreateRequest;
import com.nextcart.nextcart.inventory_module.dto.InventoryResponse;
import com.nextcart.nextcart.inventory_module.dto.InventoryUpdateRequest;
import com.nextcart.nextcart.inventory_module.entity.Inventory;

import com.nextcart.nextcart.product_module.entity.ProductVariant;

import org.springframework.stereotype.Component;

@Component
public class InventoryMapper {

    public Inventory toEntity(
            InventoryCreateRequest request,
            ProductVariant variant) {

        Inventory inventory = new Inventory();

        inventory.setVariant(variant);
        inventory.setQuantity(request.getQuantity());

        Integer reservedQuantity =
                request.getReservedQuantity() == null
                        ? 0
                        : request.getReservedQuantity();

        inventory.setReservedQuantity(reservedQuantity);

        int availableQuantity =
                request.getQuantity() - reservedQuantity;

        inventory.setAvailableQuantity(availableQuantity);




        return inventory;
    }

    public InventoryResponse toResponse(
            Inventory inventory) {

        InventoryResponse response =
                new InventoryResponse();

        response.setId(inventory.getId());

        response.setVariantId(
                inventory.getVariant().getId()
        );

        response.setQuantity(
                inventory.getQuantity()
        );

        response.setReservedQuantity(
                inventory.getReservedQuantity()
        );

        response.setAvailableQuantity(
                inventory.getAvailableQuantity()
        );



        return response;
    }

    public void updateEntity(
            InventoryUpdateRequest request,
            Inventory inventory) {

        Integer reservedQuantity =
                request.getReservedQuantity() == null
                        ? 0
                        : request.getReservedQuantity();

        inventory.setQuantity(request.getQuantity());

        inventory.setReservedQuantity(
                reservedQuantity
        );

        int availableQuantity =
                request.getQuantity() - reservedQuantity;

        inventory.setAvailableQuantity(
                availableQuantity
        );



    }

    private String getStockStatus(
            int availableQuantity) {

        if (availableQuantity <= 0) {
            return "OUT_OF_STOCK";
        }

        if (availableQuantity <= 5) {
            return "LOW_STOCK";
        }

        return "IN_STOCK";
    }
}