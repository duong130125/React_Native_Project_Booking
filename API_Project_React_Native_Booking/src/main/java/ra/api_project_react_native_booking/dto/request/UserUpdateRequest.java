package ra.api_project_react_native_booking.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import lombok.*;
import ra.api_project_react_native_booking.model.constants.GenderName;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateRequest {
    @NotBlank(message = "Full name cannot be blank")
    private String fullName;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Invalid email format")
    private String email;

    private String phoneNumber;

    @NotNull(message = "Birthday cannot be null")
    @Past(message = "Birthday must be in the past")
    private LocalDate birthday;

    @NotNull(message = "Gender cannot be null")
    private GenderName gender;
}