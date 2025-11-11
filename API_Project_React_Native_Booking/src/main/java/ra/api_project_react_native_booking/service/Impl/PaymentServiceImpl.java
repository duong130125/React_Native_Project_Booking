package ra.api_project_react_native_booking.service.Impl;

import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ra.api_project_react_native_booking.dto.request.PaymentCardRequest;
import ra.api_project_react_native_booking.dto.request.PaymentRequest;
import ra.api_project_react_native_booking.dto.response.PaymentCardResponse;
import ra.api_project_react_native_booking.dto.response.PaymentResponse;
import ra.api_project_react_native_booking.model.*;
import ra.api_project_react_native_booking.model.constants.BookingStatus;
import ra.api_project_react_native_booking.model.constants.PaymentStatus;
import ra.api_project_react_native_booking.repository.PaymentCardRepository;
import ra.api_project_react_native_booking.repository.PaymentRepository;
import ra.api_project_react_native_booking.repository.UserRepository;
import ra.api_project_react_native_booking.repository.BookingRepository;
import ra.api_project_react_native_booking.service.interfaces.PaymentService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
	private final PaymentCardRepository paymentCardRepository;
	private final PaymentRepository paymentRepository;
	private final UserRepository userRepository;
	private final BookingRepository bookingRepository;

	@Override
	public List<PaymentCardResponse> getMyCards(Long userId) {
		return paymentCardRepository.findByUserIdOrderByIsDefaultDescIdDesc(userId)
				.stream().map(this::toCardResponse).collect(Collectors.toList());
	}

	@Override
	@Transactional
	public PaymentCardResponse createCard(Long userId, PaymentCardRequest req) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new RuntimeException("User not found"));

		// Random số dư từ 1,000,000 đến 50,000,000 VND
		Random random = new Random();
		double minBalance = 1000000.0;
		double maxBalance = 50000000.0;
		double randomBalance = minBalance + (maxBalance - minBalance) * random.nextDouble();
		BigDecimal balance = BigDecimal.valueOf(randomBalance).setScale(2, RoundingMode.HALF_UP);

		// Mask card number (chỉ lưu 4 số cuối)
		String maskedCardNumber = maskCardNumber(req.getCardNumber());

		PaymentCard card = PaymentCard.builder()
				.user(user)
				.cardHolderName(req.getCardHolderName())
				.cardBrand(req.getCardBrand())
				.cardNumber(maskedCardNumber) // Lưu masked number
				.expMonth(req.getExpMonth())
				.expYear(req.getExpYear())
				.balance(balance) // Random số dư
				.isDefault(Boolean.TRUE.equals(req.getIsDefault()))
				.build();

		// Nếu là thẻ đầu tiên hoặc set default, thì set làm default
		if (Boolean.TRUE.equals(card.getIsDefault()) || paymentCardRepository.countByUserId(userId) == 0) {
			unsetDefaultForAll(userId);
			card.setIsDefault(true);
		}

		return toCardResponse(paymentCardRepository.save(card));
	}

	@Override
	@Transactional
	public PaymentCardResponse updateCard(Long userId, Long cardId, PaymentCardRequest req) {
		PaymentCard card = paymentCardRepository.findByIdAndUserId(cardId, userId)
				.orElseThrow(() -> new RuntimeException("Card not found"));

		if (req.getCardHolderName() != null)
			card.setCardHolderName(req.getCardHolderName());
		if (req.getCardBrand() != null)
			card.setCardBrand(req.getCardBrand());
		if (req.getCardNumber() != null)
			card.setCardNumber(maskCardNumber(req.getCardNumber()));
		if (req.getExpMonth() != null)
			card.setExpMonth(req.getExpMonth());
		if (req.getExpYear() != null)
			card.setExpYear(req.getExpYear());

		if (req.getIsDefault() != null && req.getIsDefault()) {
			unsetDefaultForAll(userId);
			card.setIsDefault(true);
		}

		return toCardResponse(paymentCardRepository.save(card));
	}

	@Override
	@Transactional
	public void deleteCard(Long userId, Long cardId) {
		PaymentCard card = paymentCardRepository.findByIdAndUserId(cardId, userId)
				.orElseThrow(() -> new RuntimeException("Card not found"));
		paymentCardRepository.delete(card);
	}

	@Override
	@Transactional
	public PaymentCardResponse setDefaultCard(Long userId, Long cardId) {
		PaymentCard card = paymentCardRepository.findByIdAndUserId(cardId, userId)
				.orElseThrow(() -> new RuntimeException("Card not found"));
		unsetDefaultForAll(userId);
		card.setIsDefault(true);
		return toCardResponse(paymentCardRepository.save(card));
	}

	@Override
	public PaymentResponse payBooking(Long userId, PaymentRequest request) {
		return null;
	}

	@Override
	public List<PaymentResponse> getMyPayments(Long userId) {
		return paymentRepository.findByUser_IdOrderByIdDesc(userId)
				.stream().map(this::toPaymentResponse).collect(Collectors.toList());
	}

	@Override
	public PaymentResponse getPaymentByBookingId(Long bookingId) {
		Payment payment = paymentRepository.findByBookingId(bookingId)
				.stream()
				.findFirst()
				.orElseThrow(() -> new RuntimeException("Payment not found for booking"));
		return toPaymentResponse(payment);
	}

	private PaymentCardResponse toCardResponse(PaymentCard c) {
		Hibernate.initialize(c.getUser());
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

		return PaymentCardResponse.builder()
				.id(c.getId())
				.userId(c.getUser().getId())
				.cardHolderName(c.getCardHolderName())
				.cardBrand(c.getCardBrand())
				.cardNumber(c.getCardNumber()) // Đã được mask
				.expMonth(c.getExpMonth())
				.expYear(c.getExpYear())
				.balance(c.getBalance().toPlainString())
				.isDefault(Boolean.TRUE.equals(c.getIsDefault()))
				.createdAt(c.getCreatedAt() != null ? c.getCreatedAt().format(formatter) : null)
				.updatedAt(c.getUpdatedAt() != null ? c.getUpdatedAt().format(formatter) : null)
				.build();
	}

	private PaymentResponse toPaymentResponse(Payment p) {
		Hibernate.initialize(p.getUser());
		Hibernate.initialize(p.getBooking());
		Hibernate.initialize(p.getCard());

		return PaymentResponse.builder()
				.id(p.getId())
				.userId(p.getUser().getId())
				.bookingId(p.getBooking().getId())
				.bookingCode(p.getBooking().getBookingCode())
				.cardId(p.getCard().getId())
				.cardNumber(p.getCard().getCardNumber()) // Masked
				.cardBrand(p.getCard().getCardBrand())
				.amount(p.getAmount())
				.currency(p.getCurrency())
				.status(p.getStatus())
				.message(p.getMessage())
				.createdAt(p.getCreatedAt())
				.updatedAt(p.getUpdatedAt())
				.build();
	}

	private void unsetDefaultForAll(Long userId) {
		List<PaymentCard> cards = paymentCardRepository.findByUserIdOrderByIsDefaultDescIdDesc(userId);
		for (PaymentCard card : cards) {
			if (Boolean.TRUE.equals(card.getIsDefault())) {
				card.setIsDefault(false);
			}
		}
		paymentCardRepository.saveAll(cards);
	}

	private String maskCardNumber(String cardNumber) {
		if (cardNumber == null || cardNumber.length() < 4) {
			return "****";
		}
		// Chỉ lưu 4 số cuối, các số khác thay bằng *
		String lastFour = cardNumber.substring(cardNumber.length() - 4);
		return "**** **** **** " + lastFour;
	}
}