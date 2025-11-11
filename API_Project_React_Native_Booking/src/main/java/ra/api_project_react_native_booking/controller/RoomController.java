package ra.api_project_react_native_booking.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ra.api_project_react_native_booking.dto.request.RoomFilterRequest;
import ra.api_project_react_native_booking.dto.request.RoomSearchRequest;
import ra.api_project_react_native_booking.dto.response.APIResponse;
import ra.api_project_react_native_booking.dto.response.RoomResponse;
import ra.api_project_react_native_booking.service.interfaces.RoomService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RoomController {

    private final RoomService roomService;

    @GetMapping("/search")
    public ResponseEntity<APIResponse<Page<RoomResponse>>> searchRooms(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(required = false) Integer guests,
            @RequestParam(required = false) Long roomTypeId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "price") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {

        RoomSearchRequest searchRequest = RoomSearchRequest.builder()
                .city(city)
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .guests(guests)
                .roomTypeId(roomTypeId)
                .minPrice(minPrice != null ? java.math.BigDecimal.valueOf(minPrice) : null)
                .maxPrice(maxPrice != null ? java.math.BigDecimal.valueOf(maxPrice) : null)
                .minCapacity(minCapacity)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<RoomResponse> rooms = roomService.searchRooms(searchRequest, pageable);

        return ResponseEntity.ok(
                APIResponse.<Page<RoomResponse>>builder()
                        .success(true)
                        .message("Rooms searched successfully")
                        .data(rooms)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<APIResponse<Page<RoomResponse>>> getRoomsByHotel(
            @PathVariable Long hotelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<RoomResponse> rooms = roomService.getRoomsByHotel(hotelId, pageable);

        return ResponseEntity.ok(
                APIResponse.<Page<RoomResponse>>builder()
                        .success(true)
                        .message("Rooms retrieved successfully")
                        .data(rooms)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<APIResponse<RoomResponse>> getRoomById(@PathVariable Long id) {
        RoomResponse room = roomService.getRoomById(id);

        return ResponseEntity.ok(
                APIResponse.<RoomResponse>builder()
                        .success(true)
                        .message("Room details retrieved successfully")
                        .data(room)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/available")
    public ResponseEntity<APIResponse<List<RoomResponse>>> getAvailableRooms(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {

        List<RoomResponse> rooms = roomService.getAvailableRooms(checkIn, checkOut);

        return ResponseEntity.ok(
                APIResponse.<List<RoomResponse>>builder()
                        .success(true)
                        .message("Available rooms retrieved successfully")
                        .data(rooms)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PostMapping("/filter")
    public ResponseEntity<APIResponse<Page<RoomResponse>>> filterRooms(
            @Valid @RequestBody RoomFilterRequest filterRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<RoomResponse> rooms = roomService.filterRooms(filterRequest, pageable);

        return ResponseEntity.ok(
                APIResponse.<Page<RoomResponse>>builder()
                        .success(true)
                        .message("Rooms filtered successfully")
                        .data(rooms)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/status/{isAvailable}")
    public ResponseEntity<APIResponse<Page<RoomResponse>>> getRoomsByStatus(
            @PathVariable Boolean isAvailable,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<RoomResponse> rooms = roomService.getRoomsByStatus(isAvailable, pageable);

        return ResponseEntity.ok(
                APIResponse.<Page<RoomResponse>>builder()
                        .success(true)
                        .message("Rooms retrieved by status successfully")
                        .data(rooms)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<APIResponse<Page<RoomResponse>>> getAllRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<RoomResponse> rooms = roomService.getAllRooms(pageable);

        return ResponseEntity.ok(
                APIResponse.<Page<RoomResponse>>builder()
                        .success(true)
                        .message("All rooms retrieved successfully")
                        .data(rooms)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/featured")
    public ResponseEntity<APIResponse<List<RoomResponse>>> getFeaturedRooms() {
        // Giả sử có service method để lấy featured rooms
        Pageable pageable = PageRequest.of(0, 6);
        Page<RoomResponse> featuredRooms = roomService.getAllRooms(pageable);

        return ResponseEntity.ok(
                APIResponse.<List<RoomResponse>>builder()
                        .success(true)
                        .message("Featured rooms retrieved successfully")
                        .data(featuredRooms.getContent())
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }
}