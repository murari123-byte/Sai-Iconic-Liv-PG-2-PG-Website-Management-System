package com.saiiconicliv.api;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resident_id", nullable = false)
    private Resident resident;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @NotNull
    @Column(nullable = false)
    private LocalDate paymentDate;

    @NotNull
    @Column(nullable = false)
    private String forMonth; // Format: YYYY-MM

    private String notes;

    private LocalDateTime createdAt;

    protected Payment() {
    }

    public Payment(Resident resident, BigDecimal amount, LocalDate paymentDate, String forMonth, String notes) {
        this.resident = resident;
        this.amount = amount;
        this.paymentDate = paymentDate;
        this.forMonth = forMonth;
        this.notes = notes;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Resident getResident() { return resident; }
    public BigDecimal getAmount() { return amount; }
    public LocalDate getPaymentDate() { return paymentDate; }
    public String getForMonth() { return forMonth; }
    public String getNotes() { return notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
