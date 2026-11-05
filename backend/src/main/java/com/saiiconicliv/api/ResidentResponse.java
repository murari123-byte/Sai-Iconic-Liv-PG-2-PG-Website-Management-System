package com.saiiconicliv.api;

import java.time.LocalDate;

public record ResidentResponse(
    Long id,
    String name,
    String phoneNumber,
    LocalDate joiningDate,
    Long roomId,
    String roomNumber,
    int bedNumber,
    String status,
    LocalDate vacatingDate
) {}