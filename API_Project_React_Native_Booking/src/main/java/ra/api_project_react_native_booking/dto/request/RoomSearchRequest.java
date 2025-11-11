package ra.api_project_react_native_booking.dto.request;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomSearchRequest {
    private String city;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer guests;
    private Long roomTypeId;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer minCapacity;
    private String sortBy; // price, rating, capacity
    private String sortDirection; // asc, desc
}