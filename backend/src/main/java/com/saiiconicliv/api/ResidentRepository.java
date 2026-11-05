
package com.saiiconicliv.api;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ResidentRepository extends JpaRepository<Resident, Long> {

    long countByRoom_IdAndStatus(Long roomId, String status);

    boolean existsByRoom_IdAndBedNumberAndStatus(
        Long roomId,
        int bedNumber,
        String status
    );

    @Query("""
        SELECT r FROM Resident r
        WHERE (:status IS NULL OR r.status = :status)
        AND (
            :search IS NULL OR :search = ''
            OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(r.room.roomNumber) LIKE LOWER(CONCAT('%', :search, '%'))
            OR r.phoneNumber LIKE CONCAT('%', :search, '%')
        )
        ORDER BY r.createdAt DESC
    """)
    List<Resident> searchResidents(
        @Param("search") String search,
        @Param("status") String status
    );
}
