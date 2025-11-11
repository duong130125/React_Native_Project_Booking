package ra.api_project_react_native_booking.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpResponse {
    private String message;
    private String contact; // email hoặc phone number
    private String contactType; // "email" hoặc "phone"
    private String maskedContact; // ví dụ: "cu****@example.com" hoặc "(209) ***-0104"
    private boolean success;
    private Long expiresIn;
}