package com.saiiconicliv.api;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "${app.cors.allowed-origin}")
public class PaymentAdminController {

    private final PaymentRepository paymentRepository;
    private final ResidentRepository residentRepository;
    private final RoomRepository roomRepository;
    private final PgRoomRepository pgRoomRepository;

    public PaymentAdminController(
            PaymentRepository paymentRepository,
            ResidentRepository residentRepository,
            RoomRepository roomRepository,
            PgRoomRepository pgRoomRepository) {
        this.paymentRepository = paymentRepository;
        this.residentRepository = residentRepository;
        this.roomRepository = roomRepository;
        this.pgRoomRepository = pgRoomRepository;
    }

    @GetMapping("/payments/summary")
    public List<ResidentPaymentSummaryResponse> getPaymentSummaries(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "") String month) {

        // Default to current month if not provided (Format: YYYY-MM)
        String targetMonth = (month == null || month.isBlank())
            ? LocalDate.now().toString().substring(0, 7)
            : month;

        List<Resident> residents = residentRepository.searchResidents(search, "ACTIVE");

        return residents.stream().map(resident -> {
            // Determine actual rent based on sharing type or default standard rent (e.g., 2-sharing default 12000, 3-sharing 9000, 4-sharing 7800)
            // Let's check if we can deduce sharing from room total beds or configured Room table
            int sharing = getSharingFromRoom(resident.getRoom());
            Room roomPricing = roomRepository.findBySharingAndActiveTrue(sharing).orElse(null);

            BigDecimal actualRent = roomPricing != null
                ? BigDecimal.valueOf(roomPricing.getRent())
                : getDefaultRentForSharing(sharing);

            BigDecimal totalPaid = paymentRepository.sumAmountByResidentIdAndForMonth(
                resident.getId(), targetMonth
            );
            if (totalPaid == null) {
                totalPaid = BigDecimal.ZERO;
            }

            BigDecimal balance = actualRent.subtract(totalPaid);

            return new ResidentPaymentSummaryResponse(
                resident.getId(),
                resident.getName(),
                resident.getPhoneNumber(),
                resident.getRoom().getRoomNumber(),
                resident.getBedNumber(),
                resident.getJoiningDate(),
                resident.getStatus(),
                targetMonth,
                actualRent,
                totalPaid,
                balance
            );
        }).toList();
    }

    private int getSharingFromRoom(PgRoom pgRoom) {
        // If room total beds is 2, 3, or 4, map directly. Otherwise default to 2.
        int beds = pgRoom.getTotalBeds();
        if (beds >= 2 && beds <= 4) {
            return beds;
        }
        return 2;
    }

    private BigDecimal getDefaultRentForSharing(int sharing) {
        return switch (sharing) {
            case 2 -> BigDecimal.valueOf(12000);
            case 3 -> BigDecimal.valueOf(9000);
            case 4 -> BigDecimal.valueOf(7800);
            default -> BigDecimal.valueOf(12000);
        };
    }

    public record RecordPaymentRequest(
        BigDecimal amount,
        LocalDate paymentDate,
        String forMonth,
        String notes
    ) {}

    @PostMapping("/residents/{residentId}/payments")
    @ResponseStatus(HttpStatus.CREATED)
    public Payment recordPayment(
            @PathVariable Long residentId,
            @RequestBody RecordPaymentRequest request) {
        Resident resident = residentRepository.findById(residentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resident not found"));

        Payment payment = new Payment(
            resident,
            request.amount(),
            request.paymentDate() != null ? request.paymentDate() : LocalDate.now(),
            request.forMonth(),
            request.notes()
        );

        return paymentRepository.save(payment);
    }
}
