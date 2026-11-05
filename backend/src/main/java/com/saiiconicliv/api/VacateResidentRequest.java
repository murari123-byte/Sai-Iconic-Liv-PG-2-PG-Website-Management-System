package com.saiiconicliv.api;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record VacateResidentRequest(
    @NotNull LocalDate vacatingDate
) {}