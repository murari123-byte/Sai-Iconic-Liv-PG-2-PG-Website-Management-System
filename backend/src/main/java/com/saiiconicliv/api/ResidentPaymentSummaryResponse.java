package com.saiiconicliv.api;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ResidentPaymentSummaryResponse(
    Long residentId,
    String name,
    String phoneNumber,
    String roomNumber,
    int bedNumber,
    LocalDate joiningDate,
    String status,
    String forMonth,
    BigDecimal actualRent,
    BigDecimal totalPaid,
    BigDecimal balance
) {}
