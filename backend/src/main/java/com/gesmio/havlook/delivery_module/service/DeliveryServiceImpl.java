
package com.gesmio.havlook.delivery_module.service;

import com.gesmio.havlook.delivery_module.entity.DeliveryChargeRuleEntity;
import com.gesmio.havlook.delivery_module.exceptions.DeliveryException;
import com.gesmio.havlook.delivery_module.exceptions.DeliveryRuleConfigurationException;
import com.gesmio.havlook.delivery_module.exceptions.DeliveryRuleNotFoundException;
import com.gesmio.havlook.delivery_module.repository.DeliveryChargeRuleRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryChargeRuleRepository deliveryChargeRuleRepository;

    public DeliveryServiceImpl(
            DeliveryChargeRuleRepository deliveryChargeRuleRepository) {
        this.deliveryChargeRuleRepository = deliveryChargeRuleRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateDeliveryFee(BigDecimal orderAmount) {

        if (orderAmount == null || orderAmount.signum() < 0) {
            throw new DeliveryException(
                    "Order amount must be zero or greater");
        }

        List<DeliveryChargeRuleEntity> rules =
                deliveryChargeRuleRepository.findByActiveTrue();

        DeliveryChargeRuleEntity matchedRule = null;

        for (DeliveryChargeRuleEntity rule : rules) {

            if (rule == null
                    || rule.getMinimumOrderAmount() == null
                    || rule.getDeliveryFee() == null
                    || rule.getDeliveryFee().signum() < 0) {
                throw new DeliveryRuleConfigurationException(
                        "Invalid delivery charge rule configuration");
            }

            BigDecimal minimum = rule.getMinimumOrderAmount();
            BigDecimal maximum = rule.getMaximumOrderAmount();

            if (maximum != null && maximum.compareTo(minimum) <= 0) {
                throw new DeliveryRuleConfigurationException(
                        "Maximum order amount must be greater than minimum");
            }

            boolean matches = orderAmount.compareTo(minimum) >= 0
                    && (maximum == null
                    || orderAmount.compareTo(maximum) < 0);

            if (matches) {
                if (matchedRule != null) {
                    throw new DeliveryRuleConfigurationException(
                            "Multiple active delivery rules match order amount");
                }

                matchedRule = rule;
            }
        }

        if (matchedRule == null) {
            throw new DeliveryRuleNotFoundException(
                    "No active delivery charge rule found for order amount");
        }

        return matchedRule.getDeliveryFee();
    }
}
