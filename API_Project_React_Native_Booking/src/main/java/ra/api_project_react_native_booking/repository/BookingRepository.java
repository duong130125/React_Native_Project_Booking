package ra.api_project_react_native_booking.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ra.api_project_react_native_booking.model.Booking;
import ra.api_project_react_native_booking.model.constants.BookingStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Tìm booking theo user
    Page<Booking> findByUserId(Long userId, Pageable pageable);

    // Tìm booking theo status
    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);

    // Tìm booking theo mã booking
    Optional<Booking> findByBookingCode(String bookingCode);

    // Tìm booking theo user và status
    Page<Booking> findByUserIdAndStatus(Long userId, BookingStatus status, Pageable pageable);

    // Kiểm tra phòng có available trong khoảng thời gian
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE " +
            "b.room.id = :roomId AND " +
            "b.status IN ('CONFIRMED', 'CHECKED_IN') AND " +
            "((b.checkInDate BETWEEN :checkIn AND :checkOut) OR " +
            "(b.checkOutDate BETWEEN :checkIn AND :checkOut) OR " +
            "(b.checkInDate <= :checkIn AND b.checkOutDate >= :checkOut))")
    Boolean isRoomBooked(@Param("roomId") Long roomId,
                         @Param("checkIn") LocalDate checkIn,
                         @Param("checkOut") LocalDate checkOut);
}