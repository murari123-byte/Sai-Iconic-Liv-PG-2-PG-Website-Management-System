
package com.saiiconicliv.api;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "${app.cors.allowed-origin}")
public class ApiController {

    private final RoomRepository rooms;
    private final EnquiryRepository enquiries;
    private final ResidentService residentService;

    public ApiController(
            RoomRepository rooms,
            EnquiryRepository enquiries,
            ResidentService residentService) {

        this.rooms = rooms;
        this.enquiries = enquiries;
        this.residentService = residentService;
    }

    // ================= GENERAL APIs =================

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of(
            "status", "ok",
            "service", "sai-iconic-liv-api"
        );
    }

    // ================= PUBLIC ROOM PRICING APIs =================

    @GetMapping("/rooms")
    public List<Room> listRooms() {
        return rooms.findByActiveTrueOrderBySharingAsc();
    }

    // ================= ADMIN ROOM PRICING APIs =================

    @GetMapping("/admin/rooms")
    public List<Room> adminRooms() {
        return rooms.findAll();
    }

    @PostMapping("/admin/rooms")
    @ResponseStatus(HttpStatus.CREATED)
    public Room createRoom(@Valid @RequestBody Room room) {
        return rooms.save(room);
    }

    @PutMapping("/admin/rooms/{id}")
    public Room updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody Room input) {

        Room room = rooms.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Room not found"));

        room.setSharing(input.getSharing());
        room.setRent(input.getRent());
        room.setImageUrl(input.getImageUrl());
        room.setDescription(input.getDescription());
        room.setActive(input.isActive());

        return rooms.save(room);
    }

    @DeleteMapping("/admin/rooms/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRoom(@PathVariable Long id) {

        if (!rooms.existsById(id)) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Room not found");
        }

        rooms.deleteById(id);
    }

    // ================= ENQUIRY APIs =================

    @PostMapping("/enquiries")
    @ResponseStatus(HttpStatus.CREATED)
    public Enquiry createEnquiry(
            @Valid @RequestBody Enquiry enquiry) {

        if (enquiry.getSharing() != 2
                && enquiry.getSharing() != 3
                && enquiry.getSharing() != 4) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Sharing must be 2, 3, or 4");
        }

        return enquiries.save(enquiry);
    }

    @GetMapping("/admin/enquiries")
    public List<Enquiry> listEnquiries() {
        return enquiries.findAll(
            org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.DESC,
                "createdAt"
            )
        );
    }

    @PatchMapping("/admin/enquiries/{id}/contacted")
    public Enquiry markContacted(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {

        Enquiry enquiry = enquiries.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Enquiry not found"));

        enquiry.setContacted(
            Boolean.TRUE.equals(body.get("contacted"))
        );

        return enquiries.save(enquiry);
    }

    // ================= PHYSICAL PG ROOM MANAGEMENT =================

    // Get all physical rooms with occupancy details
    @GetMapping("/admin/pg-rooms")
    public List<RoomOccupancyResponse> listPgRooms() {
        return residentService.listRoomSummaries();
    }

    // Create physical room
    @PostMapping("/admin/pg-rooms")
    @ResponseStatus(HttpStatus.CREATED)
    public PgRoom createPgRoom(
            @Valid @RequestBody CreateRoomRequest request) {

        return residentService.createRoom(
            request.roomNumber(),
            request.totalBeds()
        );
    }

    // Update physical room
    @PutMapping("/admin/pg-rooms/{id}")
    public PgRoom updatePgRoom(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoomRequest request) {

        return residentService.updateRoom(
            id,
            request.roomNumber(),
            request.totalBeds()
        );
    }

    // Deactivate physical room
    @PatchMapping("/admin/pg-rooms/{id}/deactivate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivatePgRoom(@PathVariable Long id) {
        residentService.deactivateRoom(id);
    }

    // ================= RESIDENT MANAGEMENT =================

    // Search residents by name, phone number, or room number
    @GetMapping("/admin/residents")
    public List<ResidentResponse> searchResidents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {

        return residentService.searchResidentResponses(
            search,
            status
        );
    }

    // Add a resident
    @PostMapping("/admin/residents")
    @ResponseStatus(HttpStatus.CREATED)
    public ResidentResponse addResident(
            @Valid @RequestBody CreateResidentRequest request) {

        Resident resident = residentService.addResident(
            request.name(),
            request.phoneNumber(),
            request.joiningDate(),
            request.roomId(),
            request.bedNumber()
        );

        return residentService.getResidentResponse(
            resident.getId()
        );
    }

    // Update resident details
    @PutMapping("/admin/residents/{id}")
    public ResidentResponse updateResident(
            @PathVariable Long id,
            @Valid @RequestBody UpdateResidentRequest request) {

        residentService.updateResident(
            id,
            request.name(),
            request.phoneNumber(),
            request.joiningDate()
        );

        return residentService.getResidentResponse(id);
    }

    // Mark resident as vacated
    @PatchMapping("/admin/residents/{id}/vacate")
    public ResidentResponse vacateResident(
            @PathVariable Long id,
            @Valid @RequestBody VacateResidentRequest request) {

        residentService.vacateResident(
            id,
            request.vacatingDate()
        );

        return residentService.getResidentResponse(id);
    }
}
