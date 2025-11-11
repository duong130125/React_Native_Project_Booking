package ra.api_project_react_native_booking.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ra.api_project_react_native_booking.dto.request.BookingRequest;
import ra.api_project_react_native_booking.dto.response.APIResponse;
import ra.api_project_react_native_booking.dto.response.BookingResponse;
import ra.api_project_react_native_booking.model.constants.BookingStatus;
import ra.api_project_react_native_booking.service.interfaces.BookingService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<APIResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest bookingRequest,
            @RequestHeader("user-id") Long userId) {

        BookingResponse booking = bookingService.createBooking(bookingRequest, userId);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                APIResponse.<BookingResponse>builder()
                        .success(true)
                        .message("Booking created successfully")
                        .data(booking)
                        .status(HttpStatus.CREATED)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<APIResponse<BookingResponse>> getBookingById(@PathVariable Long id) {
        BookingResponse booking = bookingService.getBookingById(id);

        return ResponseEntity.ok(
                APIResponse.<BookingResponse>builder()
                        .success(true)
                        .message("Booking retrieved successfully")
                        .data(booking)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/code/{bookingCode}")
    public ResponseEntity<APIResponse<BookingResponse>> getBookingByCode(@PathVariable String bookingCode) {
        BookingResponse booking = bookingService.getBookingByCode(bookingCode);

        return ResponseEntity.ok(
                APIResponse.<BookingResponse>builder()
                        .success(true)
                        .message("Booking retrieved successfully")
                        .data(booking)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<APIResponse<Page<BookingResponse>>> getBookingsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<BookingResponse> bookings = bookingService.getBookingsByUser(userId, pageable);

        return ResponseEntity.ok(
                APIResponse.<Page<BookingResponse>>builder()
                        .success(true)
                        .message("User bookings retrieved successfully")
                        .data(bookings)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<APIResponse<Page<BookingResponse>>> getBookingsByStatus(
            @PathVariable BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<BookingResponse> bookings = bookingService.getBookingsByStatus(status, pageable);

        return ResponseEntity.ok(
                APIResponse.<Page<BookingResponse>>builder()
                        .success(true)
                        .message("Bookings retrieved by status successfully")
                        .data(bookings)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PutMapping("/{bookingId}/status")
    public ResponseEntity<APIResponse<BookingResponse>> updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestParam BookingStatus status) {

        BookingResponse booking = bookingService.updateBookingStatus(bookingId, status);

        return ResponseEntity.ok(
                APIResponse.<BookingResponse>builder()
                        .success(true)
                        .message("Booking status updated successfully")
                        .data(booking)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<APIResponse<BookingResponse>> cancelBooking(
            @PathVariable Long bookingId,
            @RequestParam(required = false) String reason) {

        BookingResponse booking = bookingService.cancelBooking(bookingId, reason);

        return ResponseEntity.ok(
                APIResponse.<BookingResponse>builder()
                        .success(true)
                        .message("Booking cancelled successfully")
                        .data(booking)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/user/{userId}/all")
    public ResponseEntity<APIResponse<List<BookingResponse>>> getUserBookings(@PathVariable Long userId) {
        List<BookingResponse> bookings = bookingService.getUserBookings(userId);

        return ResponseEntity.ok(
                APIResponse.<List<BookingResponse>>builder()
                        .success(true)
                        .message("All user bookings retrieved successfully")
                        .data(bookings)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<APIResponse<Page<BookingResponse>>> getMyBookings(
            @RequestHeader("user-id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<BookingResponse> bookings = bookingService.getBookingsByUser(userId, pageable);

        return ResponseEntity.ok(
                APIResponse.<Page<BookingResponse>>builder()
                        .success(true)
                        .message("My bookings retrieved successfully")
                        .data(bookings)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/upcoming")
    public ResponseEntity<APIResponse<List<BookingResponse>>> getUpcomingBookings(
            @RequestHeader("user-id") Long userId) {

        // Giả sử có service method để lấy upcoming bookings
        List<BookingResponse> upcomingBookings = bookingService.getUserBookings(userId)
                .stream()
                .filter(booking -> booking.getStatus() == BookingStatus.CONFIRMED ||
                        booking.getStatus() == BookingStatus.PENDING)
                .toList();

        return ResponseEntity.ok(
                APIResponse.<List<BookingResponse>>builder()
                        .success(true)
                        .message("Upcoming bookings retrieved successfully")
                        .data(upcomingBookings)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }
}