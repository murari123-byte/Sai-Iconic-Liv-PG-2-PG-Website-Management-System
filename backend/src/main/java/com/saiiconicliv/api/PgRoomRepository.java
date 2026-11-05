
package com.saiiconicliv.api;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PgRoomRepository extends JpaRepository<PgRoom, Long> {

    Optional<PgRoom> findByRoomNumberIgnoreCase(String roomNumber);

    boolean existsByRoomNumberIgnoreCase(String roomNumber);

    List<PgRoom> findByActiveTrueOrderByRoomNumberAsc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM PgRoom r WHERE r.id = :id")
    Optional<PgRoom> findByIdForUpdate(@Param("id") Long id);
}
