package com.saiiconicliv.api;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByActiveTrueOrderBySharingAsc();
    Optional<Room> findBySharingAndActiveTrue(int sharing);
}
