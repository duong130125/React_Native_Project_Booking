package ra.api_project_react_native_booking.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ra.api_project_react_native_booking.dto.request.PaymentCardRequest;
import ra.api_project_react_native_booking.dto.response.APIResponse;
import ra.api_project_react_native_booking.dto.response.PaymentCardResponse;
import ra.api_project_react_native_booking.service.interfaces.PaymentService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/payments/cards")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentCardController {

    private final PaymentService paymentService;

    // Lấy danh sách thẻ của user
    @GetMapping
    public ResponseEntity<APIResponse<List<PaymentCardResponse>>> getMyCards(
            @RequestHeader("user-id") Long userId) {
        List<PaymentCardResponse> cards = paymentService.getMyCards(userId);
        return ResponseEntity.ok(
            APIResponse.<List<PaymentCardResponse>>builder()
                .success(true)
                .message("Lấy danh sách thẻ thành công")
                .data(cards)
                .status(HttpStatus.OK)
                .timestamp(LocalDateTime.now())
                .build()
        );
    }

    // Thêm thẻ mới
    @PostMapping
    public ResponseEntity<APIResponse<PaymentCardResponse>> createCard(
            @Valid @RequestBody PaymentCardRequest request,
            @RequestHeader("user-id") Long userId) {
        PaymentCardResponse card = paymentService.createCard(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
            APIResponse.<PaymentCardResponse>builder()
                .success(true)
                .message("Thêm thẻ thành công")
                .data(card)
                .status(HttpStatus.CREATED)
                .timestamp(LocalDateTime.now())
                .build()
        );
    }

    // Cập nhật thẻ
    @PutMapping("/{cardId}")
    public ResponseEntity<APIResponse<PaymentCardResponse>> updateCard(
            @PathVariable Long cardId,
            @Valid @RequestBody PaymentCardRequest request,
            @RequestHeader("user-id") Long userId) {
        PaymentCardResponse card = paymentService.updateCard(userId, cardId, request);
        return ResponseEntity.ok(
            APIResponse.<PaymentCardResponse>builder()
                .success(true)
                .message("Cập nhật thẻ thành công")
                .data(card)
                .status(HttpStatus.OK)
                .timestamp(LocalDateTime.now())
                .build()
        );
    }

    // Xóa thẻ
    @DeleteMapping("/{cardId}")
    public ResponseEntity<APIResponse<Void>> deleteCard(
            @PathVariable Long cardId,
            @RequestHeader("user-id") Long userId) {
        paymentService.deleteCard(userId, cardId);
        return ResponseEntity.ok(
            APIResponse.<Void>builder()
                .success(true)
                .message("Xóa thẻ thành công")
                .data(null)
                .status(HttpStatus.OK)
                .timestamp(LocalDateTime.now())
                .build()
        );
    }

    // Đặt thẻ làm mặc định
    @PutMapping("/{cardId}/set-default")
    public ResponseEntity<APIResponse<PaymentCardResponse>> setDefaultCard(
            @PathVariable Long cardId,
            @RequestHeader("user-id") Long userId) {
        PaymentCardResponse card = paymentService.setDefaultCard(userId, cardId);
        return ResponseEntity.ok(
            APIResponse.<PaymentCardResponse>builder()
                .success(true)
                .message("Đặt thẻ mặc định thành công")
                .data(card)
                .status(HttpStatus.OK)
                .timestamp(LocalDateTime.now())
                .build()
        );
    }
}

