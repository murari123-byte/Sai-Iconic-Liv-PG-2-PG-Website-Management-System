package com.saiiconicliv.api;

public record RoomOccupancyResponse(
    Long id,
    String roomNumber,
    int totalBeds,
    long occupiedBeds,
    long vacantBeds,
    boolean active
) {}