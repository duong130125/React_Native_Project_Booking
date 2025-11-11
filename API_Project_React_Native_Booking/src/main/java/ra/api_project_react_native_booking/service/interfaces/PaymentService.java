package ra.api_project_react_native_booking.service.interfaces;

import ra.api_project_react_native_booking.dto.request.PaymentCardRequest;
import ra.api_project_react_native_booking.dto.request.PaymentRequest;
import ra.api_project_react_native_booking.dto.response.PaymentCardResponse;
import ra.api_project_react_native_booking.dto.response.PaymentResponse;

import java.util.List;

public interface PaymentService {
    // Payment Card methods
    List<PaymentCardResponse> getMyCards(Long userId);
    PaymentCardResponse createCard(Long userId, PaymentCardRequest request);
    PaymentCardResponse updateCard(Long userId, Long cardId, PaymentCardRequest request);
    void deleteCard(Long userId, Long cardId);
    PaymentCardResponse setDefaultCard(Long userId, Long cardId);
    
    // Payment methods
    PaymentResponse payBooking(Long userId, PaymentRequest request);
    List<PaymentResponse> getMyPayments(Long userId);
    PaymentResponse getPaymentByBookingId(Long bookingId);
    // PaymentResponse refundPayment(Long paymentId); // Tạm thời chưa implement
}
