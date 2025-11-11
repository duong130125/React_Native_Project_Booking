package ra.api_project_react_native_booking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class APIResponse<T>{
    private Boolean success;
    private String message;
    private T data;
    private HttpStatus status;
    private Object errors;
    private LocalDateTime timestamp;
}