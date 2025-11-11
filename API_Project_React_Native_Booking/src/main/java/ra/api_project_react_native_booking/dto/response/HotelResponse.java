package ra.api_project_react_native_booking.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelResponse {
    private Long id;
    private String name;
    private String description;
    private String address;
    private String city;
    private String country;
    private Integer starRating;
    private Double latitude;
    private Double longitude;
    private String contactEmail;
    private String contactPhone;
    private String imageUrl;
    private Double averageRating;
    private Long reviewCount;
    private List<RoomResponse> rooms;
}