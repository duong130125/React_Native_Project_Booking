package ra.api_project_react_native_booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ra.api_project_react_native_booking.model.Payment;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
	// Sử dụng @Query để tránh lỗi property resolution
	@Query("SELECT p FROM Payment p WHERE p.user.id = :userId ORDER BY p.id DESC")
	List<Payment> findByUser_IdOrderByIdDesc(@Param("userId") Long userId);
	
	@Query("SELECT p FROM Payment p WHERE p.booking.id = :bookingId ORDER BY p.id DESC")
	List<Payment> findByBookingId(@Param("bookingId") Long bookingId);
	
	@Query("SELECT p FROM Payment p WHERE p.booking.id = :bookingId AND p.status = :status")
	Optional<Payment> findByBookingIdAndStatus(
		@Param("bookingId") Long bookingId, 
		@Param("status") ra.api_project_react_native_booking.model.constants.PaymentStatus status
	);
}
