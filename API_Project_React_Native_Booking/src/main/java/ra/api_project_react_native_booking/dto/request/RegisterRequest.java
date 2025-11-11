package ra.api_project_react_native_booking.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ra.api_project_react_native_booking.model.constants.GenderName;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;

    @NotBlank(message = "Email không được để trống")
    @Email(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$",
            message = "Định dạng email không hợp lệ")
    private String email;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(
            regexp = "^(03|05|07|08|09|01[2|6|8|9])[0-9]{8}$",
            message = "Số điện thoại không đúng định dạng"
    )
    private String phoneNumber;
    @NotNull(message = "Ngày sinh không thể là trống")
    @Past(message = "Ngày sinh phải là ngày trong quá khứ")
    private LocalDate birthday;
    @NotNull(message = "Giới tính không được để trống")
    private GenderName genderName;
}
