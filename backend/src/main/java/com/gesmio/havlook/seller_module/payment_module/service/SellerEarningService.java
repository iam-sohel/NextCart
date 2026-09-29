package com.gesmio.havlook.seller_module.payment_module.service;

import com.gesmio.havlook.order_module.OrderEntity;

public interface SellerEarningService {

    void createEarningsForOrder(OrderEntity order);

    void markEarningsRefunded(OrderEntity order);
}