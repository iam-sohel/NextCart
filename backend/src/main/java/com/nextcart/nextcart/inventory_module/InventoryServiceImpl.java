package com.nextcart.nextcart.inventory_module;

import com.nextcart.nextcart.inventory_module.dto.InventoryCreateRequest;
import com.nextcart.nextcart.inventory_module.dto.InventoryResponse;
import com.nextcart.nextcart.inventory_module.dto.InventoryUpdateRequest;
import com.nextcart.nextcart.inventory_module.exceptions.InsufficientStockException;
import com.nextcart.nextcart.inventory_module.exceptions.InventoryAlreadyExistsException;
import com.nextcart.nextcart.inventory_module.exceptions.InventoryNotFoundException;
import com.nextcart.nextcart.inventory_module.exceptions.InventoryValidationException;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantRepository;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;

    private final InventoryMapper inventoryMapper;

    private final ProductVariantRepository productVariantRepository;


    // =========================================================
    // CREATE INVENTORY
    // =========================================================

    @Override
    public InventoryResponse createInventory(
            InventoryCreateRequest request) {

        if (request == null) {
            throw new InventoryValidationException(
                    "Inventory request is required"
            );
        }

        Long productVariantId =
                request.getProductVariantId();

        Integer availableStock =
                request.getAvailableStock();

        validateId(
                productVariantId,
                "Product variant id"
        );

        validateNonNegativeQuantity(
                availableStock,
                "Available stock"
        );

        ProductVariantEntity productVariant =
                productVariantRepository
                        .findByIdAndStatus(
                                productVariantId,
                                ProductVariantStatus.ACTIVE
                        )
                        .orElseThrow(
                                () -> new InventoryValidationException(
                                        "Active product variant not found with id: "
                                                + productVariantId
                                )
                        );

        if (inventoryRepository.existsByProductVariantId(
                productVariantId)) {

            throw new InventoryAlreadyExistsException(
                    "Inventory already exists for product variant: "
                            + productVariantId
            );
        }

        InventoryEntity inventory =
                InventoryEntity.builder()
                        .productVariant(productVariant)
                        .availableStock(availableStock)
                        .reservedStock(0)
                        .build();

        InventoryEntity savedInventory =
                inventoryRepository.save(inventory);

        return inventoryMapper.toResponse(savedInventory);
    }


    // =========================================================
    // GET INVENTORY BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public InventoryResponse getInventoryById(
            Long id) {

        validateId(id, "Inventory id");

        InventoryEntity inventory =
                inventoryRepository.findById(id)
                        .orElseThrow(
                                () -> new InventoryNotFoundException(
                                        "Inventory not found with id: "
                                                + id
                                )
                        );

        return inventoryMapper.toResponse(inventory);
    }


    // =========================================================
    // GET INVENTORY BY PRODUCT VARIANT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public InventoryResponse getInventoryByProductVariantId(
            Long productVariantId) {

        validateId(
                productVariantId,
                "Product variant id"
        );

        InventoryEntity inventory =
                inventoryRepository
                        .findByProductVariantId(
                                productVariantId
                        )
                        .orElseThrow(
                                () -> new InventoryNotFoundException(
                                        "Inventory not found for product variant: "
                                                + productVariantId
                                )
                        );

        return inventoryMapper.toResponse(inventory);
    }


    // =========================================================
    // UPDATE INVENTORY
    // =========================================================
    //
    // This is an ADMIN stock adjustment.
    //
    // We lock the inventory row before changing it.
    //
    // availableStock cannot be lower than reservedStock.
    //
    // Example:
    //
    // available = 8
    // reserved  = 3
    //
    // Admin tries:
    // available = 2
    //
    // Result:
    // REJECT
    //
    // Because 3 units are already reserved.
    // =========================================================

    @Override
    public InventoryResponse updateInventory(
            Long id,
            InventoryUpdateRequest request) {

        validateId(id, "Inventory id");

        if (request == null) {
            throw new InventoryValidationException(
                    "Inventory update request is required"
            );
        }

        Integer requestedAvailableStock =
                request.getAvailableStock();

        validateNonNegativeQuantity(
                requestedAvailableStock,
                "Available stock"
        );

        InventoryEntity inventory =
                inventoryRepository
                        .findByIdForUpdate(id)
                        .orElseThrow(
                                () -> new InventoryNotFoundException(
                                        "Inventory not found with id: "
                                                + id
                                )
                        );

        int reservedStock =
                getSafeStock(
                        inventory.getReservedStock()
                );

        if (requestedAvailableStock < reservedStock) {

            throw new InventoryValidationException(
                    "Available stock cannot be less than reserved stock. "
                            + "Reserved stock: "
                            + reservedStock
                            + ", requested available stock: "
                            + requestedAvailableStock
            );
        }

        inventory.setAvailableStock(
                requestedAvailableStock
        );

        InventoryEntity updatedInventory =
                inventoryRepository.save(inventory);

        return inventoryMapper.toResponse(
                updatedInventory
        );
    }


    // =========================================================
    // DELETE INVENTORY
    // =========================================================

    @Override
    public void deleteInventory(Long id) {

        validateId(id, "Inventory id");

        InventoryEntity inventory =
                inventoryRepository
                        .findByIdForUpdate(id)
                        .orElseThrow(
                                () -> new InventoryNotFoundException(
                                        "Inventory not found with id: "
                                                + id
                                )
                        );

        int reservedStock =
                getSafeStock(
                        inventory.getReservedStock()
                );

        if (reservedStock > 0) {

            throw new InventoryValidationException(
                    "Cannot delete inventory while stock is reserved. "
                            + "Reserved stock: "
                            + reservedStock
            );
        }

        inventoryRepository.delete(inventory);
    }


    // =========================================================
    // ADD STOCK
    // =========================================================
    //
    // Used when warehouse/admin adds new stock.
    //
    // Example:
    //
    // available = 10
    //
    // addStock(5)
    //
    // available = 15
    // =========================================================

    @Override
    public void addStock(
            Long productVariantId,
            Integer quantity) {

        validateId(
                productVariantId,
                "Product variant id"
        );

        validatePositiveQuantity(
                quantity,
                "Stock quantity"
        );

        InventoryEntity inventory =
                inventoryRepository
                        .findByProductVariantIdForUpdate(
                                productVariantId
                        )
                        .orElseThrow(
                                () -> new InventoryNotFoundException(
                                        "Inventory not found for product variant: "
                                                + productVariantId
                                )
                        );

        int availableStock =
                getSafeStock(
                        inventory.getAvailableStock()
                );

        inventory.setAvailableStock(
                safeAdd(
                        availableStock,
                        quantity
                )
        );

        inventoryRepository.save(inventory);
    }


    // =========================================================
    // RESERVE STOCK
    // =========================================================
    //
    // Called during PLACE ORDER.
    //
    // availableStock -= quantity
    // reservedStock  += quantity
    //
    // PESSIMISTIC WRITE LOCK prevents overselling.
    // =========================================================

    @Override
    public void reserveStock(
            Long productVariantId,
            Integer quantity) {

        validateId(
                productVariantId,
                "Product variant id"
        );

        validatePositiveQuantity(
                quantity,
                "Reservation quantity"
        );

        InventoryEntity inventory =
                inventoryRepository
                        .findByProductVariantIdForUpdate(
                                productVariantId
                        )
                        .orElseThrow(
                                () -> new InventoryNotFoundException(
                                        "Inventory not found for product variant: "
                                                + productVariantId
                                )
                        );

        int availableStock =
                getSafeStock(
                        inventory.getAvailableStock()
                );

        if (availableStock < quantity) {

            throw new InsufficientStockException(
                    "Insufficient stock for product variant: "
                            + productVariantId
                            + ". Available stock: "
                            + availableStock
                            + ", requested quantity: "
                            + quantity
            );
        }

        int reservedStock =
                getSafeStock(
                        inventory.getReservedStock()
                );

        inventory.setAvailableStock(
                availableStock - quantity
        );

        inventory.setReservedStock(
                safeAdd(
                        reservedStock,
                        quantity
                )
        );

        inventoryRepository.save(inventory);
    }


    // =========================================================
    // RELEASE RESERVED STOCK
    // =========================================================
    //
    // Used when:
    //
    // 1. Payment timeout after 15 minutes
    // 2. Payment failure
    // 3. Order cancellation
    //
    // availableStock += quantity
    // reservedStock  -= quantity
    // =========================================================

    @Override
    public void releaseStock(
            Long productVariantId,
            Integer quantity) {

        validateId(
                productVariantId,
                "Product variant id"
        );

        validatePositiveQuantity(
                quantity,
                "Release quantity"
        );

        InventoryEntity inventory =
                inventoryRepository
                        .findByProductVariantIdForUpdate(
                                productVariantId
                        )
                        .orElseThrow(
                                () -> new InventoryNotFoundException(
                                        "Inventory not found for product variant: "
                                                + productVariantId
                                )
                        );

        int availableStock =
                getSafeStock(
                        inventory.getAvailableStock()
                );

        int reservedStock =
                getSafeStock(
                        inventory.getReservedStock()
                );

        if (reservedStock < quantity) {

            throw new InventoryValidationException(
                    "Cannot release more stock than reserved. "
                            + "Reserved stock: "
                            + reservedStock
                            + ", requested quantity: "
                            + quantity
            );
        }

        inventory.setReservedStock(
                reservedStock - quantity
        );

        inventory.setAvailableStock(
                safeAdd(
                        availableStock,
                        quantity
                )
        );

        inventoryRepository.save(inventory);
    }


    // =========================================================
    // DEDUCT RESERVED STOCK
    // =========================================================
    //
    // Called when the reserved stock becomes actual sold stock.
    //
    // IMPORTANT:
    //
    // DO NOT decrease availableStock here.
    //
    // Reservation already decreased availableStock.
    //
    // Only:
    //
    // reservedStock -= quantity
    // =========================================================

    @Override
    public void deductStock(
            Long productVariantId,
            Integer quantity) {

        validateId(
                productVariantId,
                "Product variant id"
        );

        validatePositiveQuantity(
                quantity,
                "Deduction quantity"
        );

        InventoryEntity inventory =
                inventoryRepository
                        .findByProductVariantIdForUpdate(
                                productVariantId
                        )
                        .orElseThrow(
                                () -> new InventoryNotFoundException(
                                        "Inventory not found for product variant: "
                                                + productVariantId
                                )
                        );

        int reservedStock =
                getSafeStock(
                        inventory.getReservedStock()
                );

        if (reservedStock < quantity) {

            throw new InventoryValidationException(
                    "Cannot deduct more stock than reserved. "
                            + "Reserved stock: "
                            + reservedStock
                            + ", requested quantity: "
                            + quantity
            );
        }

        inventory.setReservedStock(
                reservedStock - quantity
        );

        inventoryRepository.save(inventory);
    }


    // =========================================================
    // VALIDATE ID
    // =========================================================

    private void validateId(
            Long id,
            String fieldName) {

        if (id == null || id <= 0) {

            throw new InventoryValidationException(
                    fieldName + " must be greater than zero"
            );
        }
    }


    // =========================================================
    // VALIDATE NON-NEGATIVE QUANTITY
    // =========================================================

    private void validateNonNegativeQuantity(
            Integer quantity,
            String fieldName) {

        if (quantity == null || quantity < 0) {

            throw new InventoryValidationException(
                    fieldName + " cannot be negative"
            );
        }
    }


    // =========================================================
    // VALIDATE POSITIVE QUANTITY
    // =========================================================

    private void validatePositiveQuantity(
            Integer quantity,
            String fieldName) {

        if (quantity == null || quantity <= 0) {

            throw new InventoryValidationException(
                    fieldName + " must be greater than zero"
            );
        }
    }


    // =========================================================
    // NULL-SAFE STOCK
    // =========================================================

    private int getSafeStock(Integer stock) {

        return stock == null ? 0 : stock;
    }


    // =========================================================
    // SAFE STOCK ADDITION
    // =========================================================

    private int safeAdd(
            int currentStock,
            int quantity) {

        long result =
                (long) currentStock + quantity;

        if (result > Integer.MAX_VALUE) {

            throw new InventoryValidationException(
                    "Stock quantity exceeds the maximum allowed value"
            );
        }

        return (int) result;
    }
}