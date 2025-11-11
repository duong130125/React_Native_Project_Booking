package ra.api_project_react_native_booking.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomImageResponse {
    private Long id;
    private String imageUrl;
    private Boolean isPrimary;
}