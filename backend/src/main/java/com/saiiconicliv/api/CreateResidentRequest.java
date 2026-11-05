package com.saiiconicliv.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public record CreateResidentRequest(
    @NotBlank String name,

    @NotBlank
    @Pattern(regexp = "^[0-9]{10,15}$")
    String phoneNumber,

    @NotNull LocalDate joiningDate,

    @NotNull Long roomId,

    @Positive int bedNumber
) {}