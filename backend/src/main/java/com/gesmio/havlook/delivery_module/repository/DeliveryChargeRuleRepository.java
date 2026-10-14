
package com.gesmio.havlook.delivery_module.repository;

import com.gesmio.havlook.delivery_module.entity.DeliveryChargeRuleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryChargeRuleRepository
        extends JpaRepository<DeliveryChargeRuleEntity, String> {

    Optional<DeliveryChargeRuleEntity> findByRuleCode(String ruleCode);

    List<DeliveryChargeRuleEntity> findByActiveTrue();

    boolean existsByRuleCode(String ruleCode);
}
