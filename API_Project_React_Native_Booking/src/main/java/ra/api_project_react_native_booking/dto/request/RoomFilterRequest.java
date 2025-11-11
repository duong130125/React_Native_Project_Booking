package ra.api_project_react_native_booking.dto.request;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomFilterRequest {
    private Long hotelId;
    private Long roomTypeId;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer minCapacity;
    private Boolean isAvailable;
}