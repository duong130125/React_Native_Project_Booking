package ra.api_project_react_native_booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ra.api_project_react_native_booking.model.PaymentCard;
import ra.api_project_react_native_booking.model.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentCardRepository extends JpaRepository<PaymentCard, Long> {
	List<PaymentCard> findByUserIdOrderByIsDefaultDescIdDesc(Long userId);
	Optional<PaymentCard> findByIdAndUserId(Long id, Long userId);
	long countByUserId(Long userId);
}


