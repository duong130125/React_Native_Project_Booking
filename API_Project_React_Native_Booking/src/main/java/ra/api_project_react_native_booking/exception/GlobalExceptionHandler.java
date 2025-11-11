package ra.api_project_react_native_booking.exception;

import io.swagger.v3.oas.annotations.Hidden;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.apache.coyote.BadRequestException;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import ra.api_project_react_native_booking.dto.response.APIResponse;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Hidden
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<APIResponse<Map<String, String>>> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );
        return buildErrorResponse("Xác thực không thành công", errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<APIResponse<Map<String, String>>> handleConstraintViolationException(ConstraintViolationException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(error ->
                errors.put(error.getPropertyPath().toString(), error.getMessage())
        );
        return buildErrorResponse("Xác thực không thành công", errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<APIResponse<Map<String, String>>> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("message", ex.getMessage());
        return buildErrorResponse("Yêu cầu không hợp lệ", errors, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DateTimeParseException.class)
    public ResponseEntity<APIResponse<Map<String, String>>> handleDateTimeParseException(DateTimeParseException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("message", ex.getMessage());
        return buildErrorResponse("Định dạng ngày không hợp lệ", errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<APIResponse<Map<String, String>>> handleNoResourceFoundException(NoResourceFoundException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("message", ex.getMessage());
        return buildErrorResponse("Không tìm thấy tài nguyên", errors, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<APIResponse<Map<String, String>>> handleBadRequestException(BadRequestException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("message", ex.getMessage());
        return buildErrorResponse("Yêu cầu xấu", errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ChangeSetPersister.NotFoundException.class)
    public ResponseEntity<APIResponse<Map<String, String>>> handleNotFoundException(ChangeSetPersister.NotFoundException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("message", ex.getMessage());
        return buildErrorResponse("Không tìm thấy", errors, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<APIResponse<Map<String, String>>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("message", ex.getMessage());
        
        // Determine status based on error message
        HttpStatus status = HttpStatus.BAD_REQUEST;
        String errorMessage = ex.getMessage() != null ? ex.getMessage() : "Đã xảy ra lỗi";
        
        if (errorMessage.toLowerCase().contains("not found") || errorMessage.toLowerCase().contains("không tìm thấy")) {
            status = HttpStatus.NOT_FOUND;
        } else if (errorMessage.toLowerCase().contains("invalid password") || 
                   errorMessage.toLowerCase().contains("unauthorized") ||
                   errorMessage.toLowerCase().contains("không có quyền")) {
            status = HttpStatus.UNAUTHORIZED;
        } else if (errorMessage.toLowerCase().contains("đã tồn tại") || 
                   errorMessage.toLowerCase().contains("already exists")) {
            status = HttpStatus.CONFLICT;
        }
        
        return buildErrorResponse(errorMessage, errors, status);
    }

    // ✅ Dùng APIResponse chuẩn hoá
    private ResponseEntity<APIResponse<Map<String, String>>> buildErrorResponse(
            String message,
            Map<String, String> errors,
            HttpStatus status
    ) {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();

        APIResponse<Map<String, String>> response = new APIResponse<>(
                false,
                message,
                null,
                status,
                errors,
                LocalDateTime.now()
        );

        return new ResponseEntity<>(response, status);
    }
}

