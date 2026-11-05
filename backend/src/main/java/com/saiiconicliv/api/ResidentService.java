
package com.saiiconicliv.api;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ResidentService {

    private final PgRoomRepository rooms;
    private final ResidentRepository residents;

    public ResidentService(
            PgRoomRepository rooms,
            ResidentRepository residents) {
        this.rooms = rooms;
        this.residents = residents;
    }

    // Create a physical room
    @Transactional
    public PgRoom createRoom(String roomNumber, int totalBeds) {

        validateCapacity(totalBeds);

        if (roomNumber == null || roomNumber.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Room number is required");
        }

        String normalizedNumber = roomNumber.trim();

        if (rooms.existsByRoomNumberIgnoreCase(normalizedNumber)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "Room number already exists");
        }

        return rooms.save(new PgRoom(normalizedNumber, totalBeds));
    }

    // List active physical rooms
    @Transactional(readOnly = true)
    public List<PgRoom> listRooms() {
        return rooms.findByActiveTrueOrderByRoomNumberAsc();
    }

    // Update room details
    @Transactional
    public PgRoom updateRoom(
            Long roomId,
            String roomNumber,
            int totalBeds) {

        validateCapacity(totalBeds);

        PgRoom room = getLockedRoom(roomId);

        if (roomNumber == null || roomNumber.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Room number is required");
        }

        String normalizedNumber = roomNumber.trim();

        PgRoom duplicate = rooms.findByRoomNumberIgnoreCase(normalizedNumber)
            .orElse(null);

        if (duplicate != null && !duplicate.getId().equals(roomId)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "Room number already exists");
        }

        long occupiedBeds = residents.countByRoom_IdAndStatus(
            roomId, "ACTIVE");

        if (totalBeds < occupiedBeds) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Bed capacity cannot be less than active residents");
        }

        room.setRoomNumber(normalizedNumber);
        room.setTotalBeds(totalBeds);

        return rooms.save(room);
    }

    // Deactivate a physical room
    @Transactional
    public void deactivateRoom(Long roomId) {

        PgRoom room = getLockedRoom(roomId);

        long occupiedBeds = residents.countByRoom_IdAndStatus(
            roomId, "ACTIVE");

        if (occupiedBeds > 0) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Cannot deactivate a room with active residents");
        }

        room.setActive(false);
        rooms.save(room);
    }

    // Add a resident to a particular bed
    @Transactional
    public Resident addResident(
            String name,
            String phoneNumber,
            LocalDate joiningDate,
            Long roomId,
            int bedNumber) {

        PgRoom room = getLockedRoom(roomId);

        if (!room.isActive()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Room is inactive");
        }

        validateBedNumber(bedNumber, room);

        if (residents.existsByRoom_IdAndBedNumberAndStatus(
                roomId, bedNumber, "ACTIVE")) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "This bed is already occupied");
        }

        long occupiedBeds = residents.countByRoom_IdAndStatus(
            roomId, "ACTIVE");

        if (occupiedBeds >= room.getTotalBeds()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "No vacant beds available");
        }

        validateResidentDetails(name, phoneNumber, joiningDate);

        Resident resident = new Resident();

        resident.setName(name.trim());
        resident.setPhoneNumber(phoneNumber.trim());
        resident.setJoiningDate(joiningDate);
        resident.setRoom(room);
        resident.setBedNumber(bedNumber);
        resident.setStatus("ACTIVE");
        resident.setVacatingDate(null);

        return residents.save(resident);
    }

    // Update resident personal information
    @Transactional
    public Resident updateResident(
            Long residentId,
            String name,
            String phoneNumber,
            LocalDate joiningDate) {

        Resident resident = residents.findById(residentId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Resident not found"));

        if (!"ACTIVE".equals(resident.getStatus())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Vacated resident records cannot be edited");
        }

        validateResidentDetails(name, phoneNumber, joiningDate);

        resident.setName(name.trim());
        resident.setPhoneNumber(phoneNumber.trim());
        resident.setJoiningDate(joiningDate);

        return residents.save(resident);
    }

    // Mark a resident as vacated
    @Transactional
    public Resident vacateResident(
            Long residentId,
            LocalDate vacatingDate) {

        Resident existing = residents.findById(residentId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Resident not found"));

        PgRoom room = getLockedRoom(existing.getRoom().getId());

        Resident resident = residents.findById(residentId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Resident not found"));

        if (!"ACTIVE".equals(resident.getStatus())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Resident is already vacated");
        }

        if (vacatingDate == null
                || vacatingDate.isBefore(resident.getJoiningDate())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Invalid vacating date");
        }

        resident.setStatus("VACATED");
        resident.setVacatingDate(vacatingDate);

        return residents.save(resident);
    }

    // Search residents
    @Transactional(readOnly = true)
    public List<Resident> searchResidents(String search, String status) {

        if (status != null
                && !status.equals("ACTIVE")
                && !status.equals("VACATED")) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Invalid resident status");
        }

        return residents.searchResidents(search, status);
    }
    // List physical rooms with occupancy details
@Transactional(readOnly = true)
public List<RoomOccupancyResponse> listRoomSummaries() {
    return rooms.findAll().stream()
        .sorted(java.util.Comparator.comparing(PgRoom::getRoomNumber))
        .map(room -> {
            long occupied = residents.countByRoom_IdAndStatus(
                room.getId(), "ACTIVE");

            return new RoomOccupancyResponse(
                room.getId(),
                room.getRoomNumber(),
                room.getTotalBeds(),
                occupied,
                room.getTotalBeds() - occupied,
                room.isActive()
            );
        })
        .toList();
}

// Convert resident entities into safe API responses
private ResidentResponse toResidentResponse(Resident resident) {
    return new ResidentResponse(
        resident.getId(),
        resident.getName(),
        resident.getPhoneNumber(),
        resident.getJoiningDate(),
        resident.getRoom().getId(),
        resident.getRoom().getRoomNumber(),
        resident.getBedNumber(),
        resident.getStatus(),
        resident.getVacatingDate()
    );
}

// Search residents and return response DTOs
@Transactional(readOnly = true)
public List<ResidentResponse> searchResidentResponses(
        String search, String status) {
    return searchResidents(search, status).stream()
        .map(this::toResidentResponse)
        .toList();
}

// Convert a single resident into a safe API response
@Transactional(readOnly = true)
public ResidentResponse getResidentResponse(Long residentId) {
    Resident resident = residents.findById(residentId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, "Resident not found"));

    return toResidentResponse(resident);
}
    private PgRoom getLockedRoom(Long roomId) {
        return rooms.findByIdForUpdate(roomId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Room not found"));
    }

    private void validateCapacity(int totalBeds) {
        if (totalBeds < 1 || totalBeds > 5) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Room capacity must be between 1 and 5 beds");
        }
    }

    private void validateBedNumber(int bedNumber, PgRoom room) {
        if (bedNumber < 1 || bedNumber > room.getTotalBeds()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Bed number must be between 1 and "
                    + room.getTotalBeds());
        }
    }

    private void validateResidentDetails(
            String name,
            String phoneNumber,
            LocalDate joiningDate) {

        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Resident name is required");
        }

        if (phoneNumber == null
                || !phoneNumber.trim().matches("^[0-9]{10,15}$")) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Enter a valid phone number");
        }

        if (joiningDate == null || joiningDate.isAfter(LocalDate.now())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Invalid joining date");
        }
    }
}
