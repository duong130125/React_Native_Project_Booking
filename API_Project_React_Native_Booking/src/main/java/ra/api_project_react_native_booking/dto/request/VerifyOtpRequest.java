package ra.api_project_react_native_booking.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerifyOtpRequest {
    @NotBlank(message = "Không được để trống thông tin liên hệ")
    private String contact; // email hoặc phone number

    @NotBlank(message = "OTP không được để trống")
    private String otp;
}