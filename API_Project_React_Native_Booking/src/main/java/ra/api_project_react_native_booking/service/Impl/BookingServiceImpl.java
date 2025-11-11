package ra.api_project_react_native_booking.service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import ra.api_project_react_native_booking.dto.request.BookingRequest;
import ra.api_project_react_native_booking.dto.response.BookingResponse;
import ra.api_project_react_native_booking.model.Booking;
import ra.api_project_react_native_booking.model.Room;
import ra.api_project_react_native_booking.model.User;
import ra.api_project_react_native_booking.model.constants.BookingStatus;
import ra.api_project_react_native_booking.repository.BookingRepository;
import ra.api_project_react_native_booking.repository.RoomRepository;
import ra.api_project_react_native_booking.repository.UserRepository;
import ra.api_project_react_native_booking.service.interfaces.BookingService;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    @Override
    public BookingResponse createBooking(BookingRequest bookingRequest, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Room room = roomRepository.findById(bookingRequest.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        // Check room availability
        if (bookingRepository.isRoomBooked(room.getId(), bookingRequest.getCheckInDate(), bookingRequest.getCheckOutDate())) {
            throw new RuntimeException("Room is not available for the selected dates");
        }

        // Calculate total price
        long nights = ChronoUnit.DAYS.between(bookingRequest.getCheckInDate(), bookingRequest.getCheckOutDate());
        BigDecimal totalPrice = room.getPrice().multiply(BigDecimal.valueOf(nights));

        Booking booking = Booking.builder()
                .bookingCode(generateBookingCode())
                .user(user)
                .room(room)
                .checkInDate(bookingRequest.getCheckInDate())
                .checkOutDate(bookingRequest.getCheckOutDate())
                .guests(bookingRequest.getGuests())
                .totalPrice(totalPrice)
                .status(BookingStatus.PENDING)
                .specialRequests(bookingRequest.getSpecialRequests())
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        return convertToBookingResponse(savedBooking);
    }

    @Override
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return convertToBookingResponse(booking);
    }

    @Override
    public BookingResponse getBookingByCode(String bookingCode) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return convertToBookingResponse(booking);
    }

    @Override
    public Page<BookingResponse> getBookingsByUser(Long userId, Pageable pageable) {
        Page<Booking> bookings = bookingRepository.findByUserId(userId, pageable);
        return bookings.map(this::convertToBookingResponse);
    }

    @Override
    public Page<BookingResponse> getBookingsByStatus(BookingStatus status, Pageable pageable) {
        Page<Booking> bookings = bookingRepository.findByStatus(status, pageable);
        return bookings.map(this::convertToBookingResponse);
    }

    @Override
    public BookingResponse updateBookingStatus(Long bookingId, BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(status);
        Booking updatedBooking = bookingRepository.save(booking);
        return convertToBookingResponse(updatedBooking);
    }

    @Override
    public BookingResponse cancelBooking(Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        Booking cancelledBooking = bookingRepository.save(booking);
        return convertToBookingResponse(cancelledBooking);
    }

    @Override
    public List<BookingResponse> getUserBookings(Long userId) {
        return bookingRepository.findByUserId(userId, Pageable.unpaged())
                .map(this::convertToBookingResponse)
                .getContent();
    }

    private String generateBookingCode() {
        return "BK" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private BookingResponse convertToBookingResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .guests(booking.getGuests())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .specialRequests(booking.getSpecialRequests())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}