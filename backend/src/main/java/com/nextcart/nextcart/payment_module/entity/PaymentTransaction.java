package com.nextcart.nextcart.payment_module.entity;

import com.nextcart.nextcart.adcommon.entity.BaseEntity;
import com.nextcart.nextcart.order_module.OrderEntity;
import com.nextcart.nextcart.user_module.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(
        name = "payment_transactions",
        indexes = {
                @Index(
                        name = "idx_payment_transactions_order_id",
                        columnList = "order_id"
                ),
                @Index(
                        name = "idx_payment_transactions_user_id",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_payment_transactions_status",
                        columnList = "status"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction extends BaseEntity {

    // =========================================================
    // USER
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;


    // =========================================================
    // ORDER
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "order_id",
            nullable = false
    )
    private OrderEntity order;


    // =========================================================
    // RAZORPAY ORDER
    // =========================================================

    @Column(
            name = "razorpay_order_id",
            nullable = false,
            unique = true,
            length = 100
    )
    private String razorpayOrderId;


    // =========================================================
    // RAZORPAY PAYMENT
    // =========================================================

    @Column(
            name = "razorpay_payment_id",
            unique = true,
            length = 100
    )
    private String razorpayPaymentId;


    @Column(
            name = "razorpay_signature",
            length = 255
    )
    private String razorpaySignature;


    // =========================================================
    // PAYMENT AMOUNT
    // =========================================================

    @Column(
            name = "amount_in_paise",
            nullable = false
    )
    private Long amountInPaise;


    @Column(
            name = "amount_in_rupees",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal amountInRupees;


    // =========================================================
    // CURRENCY
    // =========================================================

    @Column(
            nullable = false,
            length = 3
    )
    private String currency;


    // =========================================================
    // PAYMENT STATUS
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private PaymentStatusEnum status;


    // =========================================================
    // FAILURE
    // =========================================================

    @Column(
            name = "failure_reason",
            length = 500
    )
    private String failureReason;


    // =========================================================
    // REFUND
    // =========================================================

    @Column(
            name = "razorpay_refund_id",
            unique = true,
            length = 100
    )
    private String razorpayRefundId;


    @Column(
            name = "refunded_amount_in_paise"
    )
    private Long refundedAmountInPaise;


    @Column(
            name = "refunded_amount_in_rupees",
            precision = 19,
            scale = 2
    )
    private BigDecimal refundedAmountInRupees;
}