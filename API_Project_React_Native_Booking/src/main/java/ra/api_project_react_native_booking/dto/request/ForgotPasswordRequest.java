package ra.api_project_react_native_booking.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForgotPasswordRequest {
    @NotBlank(message = "Email hoặc số điện thoại không được để trống")
    private String contact; // Có thể là email hoặc phone number
}