package com.nextcart.nextcart.order_module;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderExpiryScheduler {

    private final OrderService orderService;

    /**
     * Checks for expired unpaid orders every minute.
     *
     * Business transaction is handled by OrderService:
     *
     * PENDING
     *    ↓
     * Payment EXPIRED
     *    ↓
     * Release reserved inventory
     *    ↓
     * CANCELLED
     */
    @Scheduled(
            fixedDelayString =
                    "${nextcart.order.expiry.fixed-delay-ms:60000}"
    )
    public void expirePendingOrders() {

        try {

            orderService.expirePendingOrders();

        } catch (Exception exception) {

            /*
             * Scheduler must continue running even if one
             * execution encounters an unexpected failure.
             */
            log.error(
                    "Failed to process expired pending orders",
                    exception
            );
        }
    }
}