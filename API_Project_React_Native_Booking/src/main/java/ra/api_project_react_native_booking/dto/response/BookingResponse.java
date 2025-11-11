package ra.api_project_react_native_booking.dto.response;

import lombok.*;
import ra.api_project_react_native_booking.model.constants.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {
    private Long id;
    private String bookingCode;
    private UserResponse user;
    private RoomResponse room;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer guests;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private String specialRequests;
    private PaymentResponse payment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}