package com.saiiconicliv.api;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByResidentIdOrderByPaymentDateDesc(Long residentId);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.resident.id = :residentId AND p.forMonth = :forMonth")
    BigDecimal sumAmountByResidentIdAndForMonth(@Param("residentId") Long residentId, @Param("forMonth") String forMonth);
}
