package ra.api_project_react_native_booking.dto.response;

import lombok.*;
import ra.api_project_react_native_booking.model.constants.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private Long id;
    private Long userId;
    private Long bookingId;
    private String bookingCode;
    private Long cardId;
    private String cardNumber; // masked
    private String cardBrand;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}