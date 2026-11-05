package com.saiiconicliv.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record UpdateRoomRequest(
    @NotBlank String roomNumber,
    @Min(1) @Max(5) int totalBeds
) {}