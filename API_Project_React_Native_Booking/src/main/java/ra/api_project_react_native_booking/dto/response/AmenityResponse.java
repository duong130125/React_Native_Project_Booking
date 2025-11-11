package ra.api_project_react_native_booking.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AmenityResponse {
    private Long id;
    private String name;
    private String icon;
    private String description;
}