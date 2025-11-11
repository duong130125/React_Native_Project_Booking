package ra.api_project_react_native_booking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import ra.api_project_react_native_booking.model.constants.GenderName;

import java.time.LocalDate;
import java.util.Collection;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private boolean success;
    private String message;
    private String token;
    private Long userId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private LocalDate birthday;
    private GenderName gender;
    private Collection<? extends GrantedAuthority> authorities;
}