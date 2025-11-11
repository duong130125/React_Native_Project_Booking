package ra.api_project_react_native_booking.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomResponse {
    private Long id;
    private String roomNumber;
    private HotelResponse hotel;
    private RoomTypeResponse roomType;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private Integer capacity;
    private Integer roomSize;
    private Boolean isAvailable;
    private String description;
    private Double averageRating;
    private List<RoomImageResponse> images;
    private List<AmenityResponse> amenities;
    private Long reviewCount;
}