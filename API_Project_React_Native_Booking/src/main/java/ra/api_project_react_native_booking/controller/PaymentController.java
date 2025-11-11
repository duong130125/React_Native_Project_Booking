package ra.api_project_react_native_booking.controller;

import jakarta.validation.Valid;
import lombok.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ra.api_project_react_native_booking.dto.request.PaymentRequest;
import ra.api_project_react_native_booking.dto.response.APIResponse;
import ra.api_project_react_native_booking.dto.response.PaymentResponse;
import ra.api_project_react_native_booking.service.interfaces.PaymentService;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/pay")
    public ResponseEntity<APIResponse<PaymentResponse>> payBooking(
            @Valid @RequestBody PaymentRequest paymentRequest,
            @RequestHeader("user-id") Long userId) {
        PaymentResponse payment = paymentService.payBooking(userId, paymentRequest);

        String message = payment.getStatus().toString().equals("COMPLETED")
                ? "Thanh toán thành công"
                : payment.getMessage() != null ? payment.getMessage() : "Thanh toán thất bại";

        HttpStatus status = payment.getStatus().toString().equals("COMPLETED")
                ? HttpStatus.OK
                : HttpStatus.BAD_REQUEST;

        return ResponseEntity.status(status).body(
                APIResponse.<PaymentResponse>builder()
                        .success(payment.getStatus().toString().equals("COMPLETED"))
                        .message(message)
                        .data(payment)
                        .status(status)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<APIResponse<PaymentResponse>> getPaymentByBookingId(@PathVariable Long bookingId) {
        PaymentResponse payment = paymentService.getPaymentByBookingId(bookingId);

        return ResponseEntity.ok(
                APIResponse.<PaymentResponse>builder()
                        .success(true)
                        .message("Payment details retrieved successfully")
                        .data(payment)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    // Tạm thời comment refund vì chưa implement
    // @PostMapping("/{paymentId}/refund")
    // public ResponseEntity<APIResponse<PaymentResponse>> refundPayment(@PathVariable Long paymentId) {
    //     PaymentResponse refund = paymentService.refundPayment(paymentId);

    //     String message = refund.getStatus().toString().equals("REFUNDED")
    //             ? "Payment refunded successfully"
    //             : "Refund processing failed";

    //     HttpStatus status = refund.getStatus().toString().equals("REFUNDED")
    //             ? HttpStatus.OK
    //             : HttpStatus.BAD_REQUEST;

    //     return ResponseEntity.status(status).body(
    //             APIResponse.<PaymentResponse>builder()
    //                     .success(refund.getStatus().toString().equals("REFUNDED"))
    //                     .message(message)
    //                     .data(refund)
    //                     .status(status)
    //                     .timestamp(LocalDateTime.now())
    //                     .build()
    //     );
    // }

    // Tạm thời comment test card
    // @GetMapping("/test-card")
    // public ResponseEntity<APIResponse<TestCardResponse>> getTestCard() {
    //     TestCardResponse testCard = TestCardResponse.builder()
    //             .cardNumber("4242424242424242")
    //             .cardHolderName("TEST USER")
    //             .expiryDate("12/25")
    //             .cvv("123")
    //             .message("Use this test card for successful payments")
    //             .build();

    //     return ResponseEntity.ok(
    //             APIResponse.<TestCardResponse>builder()
    //                     .success(true)
    //                     .message("Test card details retrieved successfully")
    //                     .data(testCard)
    //                     .status(HttpStatus.OK)
    //                     .timestamp(LocalDateTime.now())
    //                     .build()
    //     );
    // }

    @GetMapping("/status/{paymentId}")
    public ResponseEntity<APIResponse<PaymentResponse>> getPaymentStatus(@PathVariable Long paymentId) {
        PaymentResponse payment = paymentService.getPaymentByBookingId(paymentId);

        return ResponseEntity.ok(
                APIResponse.<PaymentResponse>builder()
                        .success(true)
                        .message("Payment status retrieved successfully")
                        .data(payment)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/my-payments")
    public ResponseEntity<APIResponse<java.util.List<PaymentResponse>>> getMyPayments(
            @RequestHeader("user-id") Long userId) {
        java.util.List<PaymentResponse> payments = paymentService.getMyPayments(userId);
        return ResponseEntity.ok(
                APIResponse.<java.util.List<PaymentResponse>>builder()
                        .success(true)
                        .message("Lấy danh sách thanh toán thành công")
                        .data(payments)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    // Response DTO for test card - tạm thời comment
    // @Getter
    // @Setter
    // @Builder
    // @NoArgsConstructor
    // @AllArgsConstructor
    // public static class TestCardResponse {
    //     private String cardNumber;
    //     private String cardHolderName;
    //     private String expiryDate;
    //     private String cvv;
    //     private String message;
    // }
}