package ra.api_project_react_native_booking.service.interfaces;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import ra.api_project_react_native_booking.dto.request.BookingRequest;
import ra.api_project_react_native_booking.dto.response.BookingResponse;
import ra.api_project_react_native_booking.model.constants.BookingStatus;

import java.util.List;

public interface BookingService {
    BookingResponse createBooking(BookingRequest bookingRequest, Long userId);
    BookingResponse getBookingById(Long id);
    BookingResponse getBookingByCode(String bookingCode);
    Page<BookingResponse> getBookingsByUser(Long userId, Pageable pageable);
    Page<BookingResponse> getBookingsByStatus(BookingStatus status, Pageable pageable);
    BookingResponse updateBookingStatus(Long bookingId, BookingStatus status);
    BookingResponse cancelBooking(Long bookingId, String reason);
    List<BookingResponse> getUserBookings(Long userId);
}