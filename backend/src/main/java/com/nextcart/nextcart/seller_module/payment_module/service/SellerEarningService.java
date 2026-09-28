package com.nextcart.nextcart.seller_module.payment_module.service;

import com.nextcart.nextcart.order_module.OrderEntity;

public interface SellerEarningService {

    void createEarningsForOrder(OrderEntity order);

    void markEarningsRefunded(OrderEntity order);
}