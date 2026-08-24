package com.nextcart.nextcart.product_module.inventory;

import com.nextcart.nextcart.product_module.inventory.dto.InventoryCreateRequest;
import com.nextcart.nextcart.product_module.inventory.dto.InventoryResponse;
import com.nextcart.nextcart.product_module.inventory.dto.InventoryUpdateRequest;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductVariantRepository productVariantRepository;
    private final InventoryMapper inventoryMapper;

    public InventoryServiceImpl(
            InventoryRepository inventoryRepository,
            ProductVariantRepository productVariantRepository,
            InventoryMapper inventoryMapper) {

        this.inventoryRepository = inventoryRepository;
        this.productVariantRepository = productVariantRepository;
        this.inventoryMapper = inventoryMapper;
    }

    @Override
    public InventoryResponse createInventory(
            InventoryCreateRequest request) {

        ProductVariantEntity productVariant =
                productVariantRepository.findById(
                        request.getProductVariantId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Product variant not found with id: "
                                        + request.getProductVariantId()
                        )
                );

        if (inventoryRepository.existsByProductVariantId(
                request.getProductVariantId())) {

            throw new RuntimeException(
                    "Inventory already exists for product variant id: "
                            + request.getProductVariantId()
            );
        }

        InventoryEntity inventory = InventoryEntity.builder()
                .productVariant(productVariant)
                .availableStock(request.getAvailableStock())
                .reservedStock(0)
                .build();

        InventoryEntity savedInventory =
                inventoryRepository.save(inventory);

        return inventoryMapper.toResponse(savedInventory);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryResponse getInventoryById(Long id) {

        InventoryEntity inventory =
                inventoryRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Inventory not found with id: "
                                                + id
                                )
                        );

        return inventoryMapper.toResponse(inventory);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryResponse getInventoryByProductVariantId(
            Long productVariantId) {

        InventoryEntity inventory =
                inventoryRepository
                        .findByProductVariantId(productVariantId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Inventory not found for product variant id: "
                                                + productVariantId
                                )
                        );

        return inventoryMapper.toResponse(inventory);
    }

    @Override
    public InventoryResponse updateInventory(
            Long id,
            InventoryUpdateRequest request) {

        InventoryEntity inventory =
                inventoryRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Inventory not found with id: "
                                                + id
                                )
                        );

        inventory.setAvailableStock(
                request.getAvailableStock()
        );

        InventoryEntity updatedInventory =
                inventoryRepository.save(inventory);

        return inventoryMapper.toResponse(updatedInventory);
    }

    @Override
    public void deleteInventory(Long id) {

        if (!inventoryRepository.existsById(id)) {

            throw new RuntimeException(
                    "Inventory not found with id: " + id
            );
        }

        inventoryRepository.deleteById(id);
    }

    @Override
    public void addStock(
            Long productVariantId,
            Integer quantity) {

        validateQuantity(quantity);

        InventoryEntity inventory =
                getInventoryEntity(productVariantId);

        inventory.setAvailableStock(
                inventory.getAvailableStock() + quantity
        );

        inventoryRepository.save(inventory);
    }

    @Override
    public void reserveStock(
            Long productVariantId,
            Integer quantity) {

        validateQuantity(quantity);

        InventoryEntity inventory =
                getInventoryEntity(productVariantId);

        if (inventory.getAvailableStock() < quantity) {
            throw new RuntimeException(
                    "Insufficient available stock for product variant id: "
                            + productVariantId
            );
        }

        inventory.setAvailableStock(
                inventory.getAvailableStock() - quantity
        );

        inventory.setReservedStock(
                inventory.getReservedStock() + quantity
        );

        inventoryRepository.save(inventory);
    }

    @Override
    public void releaseStock(
            Long productVariantId,
            Integer quantity) {

        validateQuantity(quantity);

        InventoryEntity inventory =
                getInventoryEntity(productVariantId);

        if (inventory.getReservedStock() < quantity) {
            throw new RuntimeException(
                    "Insufficient reserved stock for product variant id: "
                            + productVariantId
            );
        }

        inventory.setReservedStock(
                inventory.getReservedStock() - quantity
        );

        inventory.setAvailableStock(
                inventory.getAvailableStock() + quantity
        );

        inventoryRepository.save(inventory);
    }

    @Override
    public void deductStock(
            Long productVariantId,
            Integer quantity) {

        validateQuantity(quantity);

        InventoryEntity inventory =
                getInventoryEntity(productVariantId);

        if (inventory.getReservedStock() < quantity) {
            throw new RuntimeException(
                    "Insufficient reserved stock for product variant id: "
                            + productVariantId
            );
        }

        inventory.setReservedStock(
                inventory.getReservedStock() - quantity
        );

        inventoryRepository.save(inventory);
    }

    private InventoryEntity getInventoryEntity(
            Long productVariantId) {

        return inventoryRepository
                .findByProductVariantId(productVariantId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Inventory not found for product variant id: "
                                        + productVariantId
                        )
                );
    }

    private void validateQuantity(Integer quantity) {

        if (quantity == null || quantity <= 0) {
            throw new RuntimeException(
                    "Quantity must be greater than zero"
            );
        }
    }
}