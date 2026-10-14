package com.gesmio.havlook.delivery_module.service;

import java.math.BigDecimal;

public interface DeliveryService {

    BigDecimal calculateDeliveryFee(BigDecimal orderAmount);
}